# Android APK Builds

This folder is intended for release binaries produced by local Gradle builds.

## Local build

Requires Android SDK and JDK 17+.

```bash
cd ../app
npx expo prebuild --platform android
cd android
export GRADLE_USER_HOME="$HOME/.gradle"
./gradlew clean assembleRelease
cp app/build/outputs/apk/release/app-release.apk ../../builds/checkout-release.apk
```

On Windows (Git Bash), set `GRADLE_USER_HOME` to a short path to avoid build failures from path length limits:

```bash
export GRADLE_USER_HOME="C:/Users/$USER/.gradle"
```

## Install on emulator

With the API running on port 3000 and an emulator started:

```bash
adb install -r checkout-release.apk
```

If installation fails with `INSTALL_FAILED_INSUFFICIENT_STORAGE`, uninstall the previous build first:

```bash
adb shell pm uninstall com.anonymous.app
adb install -r checkout-release.apk
```

## Note

APK files are not committed to git by default. Generate them using the commands above before submission.

The release build requires `app/android/app/src/release/AndroidManifest.xml` with `usesCleartextTraffic=true` so the app can reach the API over `http://` (e.g. `http://10.0.2.2:3000/api` on the emulator).
