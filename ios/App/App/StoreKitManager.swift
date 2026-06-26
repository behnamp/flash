import Foundation
import StoreKit

// Product IDs matching App Store Connect
enum FlashProduct: String, CaseIterable {
    case starter    = "app.flashcam.flash.starter"
    case small      = "app.flashcam.flash.small"
    case medium     = "app.flashcam.flash.medium"
    case large      = "app.flashcam.flash.large"
    case xl         = "app.flashcam.flash.xl"
    case unlimited  = "app.flashcam.flash.unlimited"
    case keepForever = "app.flashcam.flash.keep_forever"

    var guestCap: Int {
        switch self {
        case .starter:    return 10
        case .small:      return 25
        case .medium:     return 50
        case .large:      return 100
        case .xl:         return 200
        case .unlimited:  return 9999
        case .keepForever: return 0
        }
    }

    var tier: String {
        switch self {
        case .starter:    return "mini"
        case .small:      return "standard"
        case .medium:     return "medium"
        case .large:      return "large"
        case .xl:         return "xl"
        case .unlimited:  return "unlimited"
        case .keepForever: return "keep_forever"
        }
    }
}

@MainActor
class StoreKitManager: NSObject, ObservableObject {
    static let shared = StoreKitManager()

    @Published var products: [Product] = []
    @Published var purchaseState: PurchaseState = .idle

    enum PurchaseState {
        case idle
        case loading
        case purchasing
        case success(eventId: String, tier: String)
        case failed(error: String)
    }

    var updateListenerTask: Task<Void, Error>?

    override init() {
        super.init()
        updateListenerTask = listenForTransactions()
        Task { await loadProducts() }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    func loadProducts() async {
        do {
            let ids = FlashProduct.allCases.map { $0.rawValue }
            products = try await Product.products(for: ids)
            products.sort { $0.price < $1.price }
        } catch {
            print("StoreKit: Failed to load products: \(error)")
        }
    }

    func purchase(productId: String, eventId: String) async {
        purchaseState = .purchasing
        guard let product = products.first(where: { $0.id == productId }) else {
            purchaseState = .failed(error: "Product not found")
            return
        }

        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                switch verification {
                case .verified(let transaction):
                    await transaction.finish()
                    let flashProduct = FlashProduct(rawValue: productId)
                    let tier = flashProduct?.tier ?? "standard"
                    let guestCap = flashProduct?.guestCap ?? 50
                    // Activate event via Supabase
                    await activateEvent(eventId: eventId, tier: tier, guestCap: guestCap, transactionId: String(transaction.id))
                case .unverified(_, let error):
                    purchaseState = .failed(error: "Purchase verification failed: \(error.localizedDescription)")
                }
            case .userCancelled:
                purchaseState = .idle
            case .pending:
                purchaseState = .idle
            @unknown default:
                purchaseState = .idle
            }
        } catch {
            purchaseState = .failed(error: error.localizedDescription)
        }
    }

    private func activateEvent(eventId: String, tier: String, guestCap: Int, transactionId: String) async {
        let supabaseUrl = "https://onvdddlkrlwaxwufgodq.supabase.co"
        let serviceKey = ProcessInfo.processInfo.environment["SUPABASE_SERVICE_ROLE_KEY"]
            ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udmRkZGxrcmx3YXh3dWZnb2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE1ODQ0NywiZXhwIjoyMDk3NzM0NDQ3fQ.66kMVxzDQduk0-Ri399emoJNEaHi2X3ZX5TJByICnac"

        guard let url = URL(string: "\(supabaseUrl)/rest/v1/events?id=eq.\(eventId)") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(serviceKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(serviceKey)", forHTTPHeaderField: "Authorization")
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")

        let body: [String: Any] = [
            "paid": true,
            "is_active": true,
            "payment_tier": tier,
            "guest_cap": guestCap,
            "stripe_session_id": "apple_\(transactionId)",
            "paid_at": ISO8601DateFormatter().string(from: Date())
        ]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            if let http = response as? HTTPURLResponse, http.statusCode == 204 {
                purchaseState = .success(eventId: eventId, tier: tier)
            } else {
                purchaseState = .failed(error: "Failed to activate event")
            }
        } catch {
            purchaseState = .failed(error: error.localizedDescription)
        }
    }

    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await transaction.finish()
                }
            }
        }
    }
}
