# Mateu Compose renderer (Kotlin Multiplatform)

A renderer for Mateu UIs built with **Compose Multiplatform** in Kotlin. It speaks Mateu's wire
contract, calls a running backend over HTTP and renders the returned `UIIncrementDto` with native
Compose widgets. It is the Kotlin counterpart of the JavaFX renderer (`frontend/app/javafx`).

The codebase is **multiplatform**: all rendering logic lives in `commonMain` and is platform-agnostic.
Only the **desktop (JVM)** target is wired up today; adding Android / iOS / Web is mechanical (see
below) because no shared code touches a JVM-only API.

## Structure

```
src/
  commonMain/kotlin/io/mateu/compose/
    api/MateuApiClient.kt   ← Ktor client + kotlinx.serialization; `expect fun createHttpClient()`
    state/AppState.kt       ← session state holder (observable slots, navigation, actions)
    ui/MateuApp.kt          ← platform-agnostic root composable (each entry point hosts it)
    ui/                     ← all the @Composable renderers + Json.kt (JsonElement helpers)
  desktopMain/kotlin/io/mateu/compose/
    Main.kt                 ← desktop entry point (Window/application)
    api/Platform.desktop.kt ← `actual fun createHttpClient()` = HttpClient(CIO)
  desktopMain/resources/application.properties
  iosMain/kotlin/io/mateu/compose/
    MainViewController.kt   ← iOS entry (ComposeUIViewController)
    api/Platform.ios.kt     ← `actual createHttpClient()` = HttpClient(Darwin)
  androidMain/…             ← MainActivity + OkHttp actual + manifest (opt-in; see build.gradle.kts)
iosApp/                     ← SwiftUI host for the iOS app (project.yml for xcodegen)
```

Targets wired: **desktop (JVM)** and **iOS** (framework `MateuKit`). **Android** is ready but opt-in
(needs the Android SDK) — see the comment block at the bottom of `build.gradle.kts`.

`ui/Json.kt` aliases `JsonNode = kotlinx.serialization.JsonElement` and reproduces the slice of the
Jackson API the renderers use, so the renderer code stayed unchanged through the JSON migration.

## Configure the backend

Edit `src/desktopMain/resources/application.properties`:

```properties
mateu.baseUrl=http://localhost:8592
mateu.route=/
mateu.config={}
```

## Run (desktop)

```bash
./gradlew run             # launch the desktop app
./gradlew compileKotlinDesktop
./gradlew packageDmg      # native installer (macOS); packageMsi / packageDeb elsewhere
```

JDK 21 toolchain is auto-provisioned via the foojay resolver, so it builds even on a different JDK.

Preview the **mobile UI** without a device — run desktop in a phone-sized window:
`mateu.windowMode=mobile` in `application.properties` (or `-Dmateu.windowMode=mobile`).

## Run on iOS (Xcode + an iOS Simulator runtime required)

```bash
cd iosApp && xcodegen generate        # one-time: brew install xcodegen
xcodebuild -project iosApp.xcodeproj -scheme iosApp -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15' -derivedDataPath build/ddata build
xcrun simctl boot "iPhone 15"; open -a Simulator
xcrun simctl install booted build/ddata/Build/Products/Debug-iphonesimulator/iosApp.app
xcrun simctl launch booted io.mateu.compose.iosApp
```
See [`iosApp/README.md`](iosApp/README.md). The simulator reaches the Mac's `localhost`.

## Run on Android (Android SDK required)

`build.gradle.kts` pins `org.gradle.java.home` to a JDK 21 (AGP doesn't run on JDK 24 — adjust the
path for your machine) and `local.properties` needs `sdk.dir`. Then:
```bash
./gradlew assembleDebug                              # build the APK
$ANDROID_HOME/emulator/emulator -avd <name> &        # boot an emulator
adb install -r build/outputs/apk/debug/mateu-compose-debug.apk
adb shell am start -n io.mateu.compose/.MainActivity
```
The emulator reaches the host backend at `http://10.0.2.2:8592` (manifest sets `usesCleartextTraffic`).

## Still to add

- **Web** (`wasmJs { browser() }` + `ktor-client-js` + `CanvasBasedWindow`) — same `commonMain` reused.
- Desktop **auto-update**: wrap the packaged app with [Conveyor](https://conveyor.hydraulic.dev/).
