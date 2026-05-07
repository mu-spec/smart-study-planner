# Codemagic APK Build

1. Push this project to GitHub.
2. In Codemagic, add app from your GitHub repo.
3. Select `codemagic.yaml` workflow: `android-release-apk`.
4. Start build.
5. Download APK from Artifacts.

## Important signing note
Current Android `release` buildType uses debug signing in [android/app/build.gradle](android/app/build.gradle).
For Play Store-ready release, add your own keystore in Codemagic environment and update signing config.
