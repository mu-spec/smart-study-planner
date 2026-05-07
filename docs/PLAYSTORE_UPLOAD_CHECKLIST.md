# Playstore Handoff Checklist (Play Store Upload)

## 1) What is already done
- App code is complete (tasks, scheduling, notifications, progress, ads integration).
- Expo EAS project is linked.
- Android production build pipeline is set.

## 2) Must-do before final production build
- Set real AdMob app ID:
  - `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID`
- Set real AdMob ad unit IDs:
  - `EXPO_PUBLIC_ADMOB_BANNER_ANDROID`
  - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
- Set Firebase values (required for online sync):
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`

## 3) Build command
```bash
npx eas-cli build --platform android --profile production
```

## 4) Upload to Play Console
- Upload produced `.aab` to Internal testing first.
- Complete policy/forms:
  - Ads declaration
  - Data safety
  - Content rating
  - Privacy policy
  - Store listing

## 5) Important
- Production build now fails if AdMob Android app ID is not set (to prevent uploading test-ads build).
