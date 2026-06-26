import Capacitor
import Foundation

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isNative", returnType: CAPPluginReturnPromise),
    ]

    @objc func isNative(_ call: CAPPluginCall) {
        call.resolve(["native": true, "platform": "ios"])
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        Task { @MainActor in
            let manager = StoreKitManager.shared
            if manager.products.isEmpty {
                await manager.loadProducts()
            }
            let productList = manager.products.map { p -> [String: Any] in
                return [
                    "id": p.id,
                    "displayName": p.displayName,
                    "description": p.description,
                    "price": p.price.description,
                    "displayPrice": p.displayPrice,
                ]
            }
            call.resolve(["products": productList])
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId"),
              let eventId = call.getString("eventId") else {
            call.reject("Missing productId or eventId")
            return
        }

        Task { @MainActor in
            let manager = StoreKitManager.shared
            await manager.purchase(productId: productId, eventId: eventId)

            switch manager.purchaseState {
            case .success(let eId, let tier):
                call.resolve(["success": true, "eventId": eId, "tier": tier])
            case .failed(let error):
                call.reject(error)
            case .idle:
                call.reject("Purchase cancelled")
            default:
                call.reject("Unknown state")
            }
        }
    }
}
