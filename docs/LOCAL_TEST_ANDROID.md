# Local Android Test (Phone)

This guide fixes the Kotlin cache mismatch error and runs the app on your phone.

## 1) Clean Kotlin/Gradle caches
```powershell
cd android
.\gradlew --stop
Remove-Item -Recurse -Force .gradle
cd ..
Remove-Item -Recurse -Force C:\Users\PMLS\.gradle\caches\kotlin
Remove-Item -Recurse -Force C:\Users\PMLS\.gradle\caches\modules-2
cd android
.\gradlew clean
cd ..
```

## 2) Build and run on phone
```powershell
npx expo run:android
```

## 3) Start Metro (new terminal)
```powershell
npx expo start --clear
```

## 4) If the phone can’t connect to Metro
```powershell
adb reverse tcp:8081 tcp:8081
```

