# AI Smart Study Planner (React Native)

Core app with:
- Home / Add Task / Progress screens
- AI-like schedule generation
- AI exam preparation planner
- Calendar view
- Voice task parsing (dictated-text input)
- Dark mode toggle
- Gamification (XP + badges)
- Weekly study report
- Google login (when Google client IDs are configured)
- Local notifications
- Offline-first storage + Firebase sync
- AdMob banner + interstitial ads
- App icon + Android adaptive icon configured

## 1. Install

```bash
npm install
```

## 2. Environment setup

Copy `.env.example` to `.env` and fill real values:

- AdMob IDs (`EXPO_PUBLIC_ADMOB_*`)
- Firebase keys (`EXPO_PUBLIC_FIREBASE_*`)

Without real values:
- App still runs
- Firebase sync is disabled
- Ads use test units in development

## 3. Run on Android (dev)

```bash
npx expo prebuild
npx expo run:android --port 8082
```

To start Metro for dev client:

```bash
npx expo start --dev-client --port 8082
```

## 4. Build release AAB (Play Store upload)

This machine currently uses low-memory Android settings. For Play Store release use ARM architecture:

```bash
cd android
gradlew bundleRelease -PreactNativeArchitectures=arm64-v8a
```

Output:

`android/app/build/outputs/bundle/release/app-release.aab`

If local NDK build fails due memory, use EAS cloud build:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

The EAS build gives you a downloadable `.aab` for Play Console.

## 5. Play Store checklist

See full checklist here:

`docs/PLAYSTORE_RELEASE_CHECKLIST.md`
