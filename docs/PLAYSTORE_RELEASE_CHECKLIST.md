# Play Store Release Checklist

## A. Ad monetization (required to earn)

1. Create AdMob app and ad units:
- Banner unit
- Interstitial unit

2. Add real IDs to `.env`:
- `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID`
- `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`
- `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`

3. Add `app-ads.txt` to your website and configure domain in AdMob.

4. Keep consent flow enabled (already implemented in app via `AdsConsent`).

## B. Firebase online sync

1. Create Firebase project.
2. Enable Firestore.
3. Put Firebase values in `.env`:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## C. Android release signing

1. Create upload keystore (one-time):

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

2. Put keystore in:

`android/app/upload-keystore.jks`

3. Add secrets (do not commit):

`android/keystore.properties`

```properties
storeFile=upload-keystore.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

4. Update `android/app/build.gradle` release signing to use `keystore.properties`.

## D. Build Play Store artifact

Local build option:

```bash
cd android
gradlew bundleRelease -PreactNativeArchitectures=arm64-v8a
```

Upload this file to Play Console:

`android/app/build/outputs/bundle/release/app-release.aab`

If local build fails with NDK/LLVM out-of-memory, use EAS cloud build:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

Download the generated `.aab` from the EAS build link and upload it to Play Console.

## E. Play Console compliance

1. App access and test credentials (if needed)
2. Data safety form
3. Ads declaration
4. Content rating questionnaire
5. Privacy policy URL
6. Target audience
7. Store listing (screenshots, short/full description)

## F. New Play account note

If this is a new personal Play Console account, Google may require closed testing (for example 12 testers for 14 days) before production rollout.
