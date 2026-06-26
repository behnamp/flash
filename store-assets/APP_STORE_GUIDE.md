# Flash — App Store & Google Play Submission Guide

## App Details

| Field | Value |
|-------|-------|
| App Name | Flash — Disposable Camera |
| Bundle ID (iOS) | app.flashcam.flash |
| Package Name (Android) | app.flashcam.flash |
| Version | 1.0.0 |
| Category | Photo & Video |
| Price | Free (in-app purchases) |

---

## Short Description (80 chars)
Disposable camera for events. Guests shoot, host reveals. No downloads needed.

## Full Description
Flash turns any event into a shared disposable camera experience.

Create an event, share a QR code, and every guest becomes a photographer — shooting on their own phone, no app download required. When the night is done, you reveal all the photos at once, just like developing film.

**How it works:**
• Host creates an event and shares a QR code
• Guests scan and shoot — 10–40 shots each
• Photos stay hidden until the host reveals them
• Everyone sees all the photos at once

**Features:**
• 5 film modes — Kodak Gold, Black & White, Portra 400, Polaroid, Golden Hour
• Flash torch, zoom controls, upload from camera roll
• Live slideshow for casting to a TV at the event
• Download all photos as a ZIP
• Free for up to 5 guests, paid plans from $1.99 CAD

**Perfect for:** Weddings, birthdays, house parties, corporate events, festivals, travel groups.

---

## Keywords (App Store, 100 chars max)
disposable camera,event photos,film camera,photo booth,group photos,wedding,party

## Support URL
https://flashcam.app/legal/privacy

## Privacy Policy URL
https://flashcam.app/legal/privacy

## Marketing URL
https://flashcam.app

---

## What's New (v1.0.0)
First release — create events, shoot with film filters, reveal together.

---

## iOS Build Instructions

1. **Prerequisites:**
   - Mac with Xcode 15+
   - Apple Developer account ($99/year)
   - CocoaPods installed: `sudo gem install cocoapods`

2. **Setup:**
   ```bash
   cd /path/to/flash
   npm run build          # builds Next.js (though we use live URL)
   npx cap sync ios       # syncs Capacitor config to Xcode project
   npx cap open ios       # opens Xcode
   ```

3. **In Xcode:**
   - Select "App" target
   - Set Team to your Apple Developer account
   - Bundle Identifier: `app.flashcam.flash`
   - Version: 1.0.0, Build: 1
   - Select "Any iOS Device (arm64)" as destination
   - Product → Archive
   - Distribute App → App Store Connect → Upload

4. **App Store Connect:**
   - Create new app at appstoreconnect.apple.com
   - Upload screenshots (see sizes below)
   - Fill in metadata from above
   - Submit for review

---

## Android Build Instructions

1. **Prerequisites:**
   - Android Studio (latest)
   - Google Play Developer account ($25 one-time)
   - JDK 17+

2. **Setup:**
   ```bash
   cd /path/to/flash
   npx cap sync android    # syncs config
   npx cap open android    # opens Android Studio
   ```

3. **In Android Studio:**
   - Build → Generate Signed Bundle/APK
   - Choose "Android App Bundle" (AAB)
   - Create keystore: `keytool -genkey -v -keystore flash-release.keystore -alias flash -keyalg RSA -keysize 2048 -validity 10000`
   - Store keystore safely — you need it for every update
   - Build release AAB

4. **Google Play Console:**
   - Create app at play.google.com/console
   - Create new release in "Production" track
   - Upload the .aab file
   - Fill in store listing from metadata above
   - Submit for review

---

## Required Screenshots

### iOS (iPhone 6.7" — iPhone 15 Pro Max)
Size: 1290 × 2796 px
Needed: 3–10 screenshots

Suggested screens:
1. Camera viewfinder with film strip
2. Event join page with QR code
3. Gallery reveal moment
4. Host dashboard
5. Pricing/plans page

### Android (Phone)
Size: 1080 × 1920 px (minimum)
Needed: 2–8 screenshots

---

## App Icon Requirements

### iOS
- 1024×1024 px PNG, no alpha, no rounded corners (App Store does rounding)
- Design: Yellow (#e8ff47) background, black Flash bolt centered

### Android
- 512×512 px PNG
- Adaptive icon: foreground layer (bolt on transparent), background layer (yellow)
- Files needed:
  - ic_launcher.png (48, 72, 96, 144, 192 dp)
  - ic_launcher_round.png (same sizes)

---

## Review Notes for App Stores

**iOS Review Notes:**
- App uses WKWebView to load https://flashcam.app
- Camera permission used for: taking event photos
- Photo library permission used for: uploading photos from camera roll
- In-app purchases: one-time event activation fees ($1.99–$99.99 CAD)
- No account required for guests; hosts create accounts

**Content Rating:** 4+ (no objectionable content)

---

## In-App Purchases (iOS)

Must register these in App Store Connect:
| Product ID | Price | Description |
|-----------|-------|-------------|
| flash_mini | $1.99 | Starter — up to 10 guests |
| flash_standard | $4.99 | Small — up to 25 guests |
| flash_medium | $9.99 | Medium — up to 50 guests |
| flash_large | $14.99 | Large — up to 100 guests |
| flash_xl | $29.99 | XL — up to 200 guests |
| flash_unlimited | $99.99 | Unlimited guests |
| flash_keep_forever | $4.99 | Keep photos forever |

Note: Currently processed via Stripe (web checkout). For App Store compliance,
in-app purchases through Apple's StoreKit may be required for digital goods.
Consult Apple's guidelines — physical events may qualify for web-only checkout.

