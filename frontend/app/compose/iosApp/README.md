# Mateu iOS app

Hosts the Compose UI (from the `MateuKit` Kotlin framework) in a SwiftUI app.

The Kotlin side is already wired: the `iosMain` source set provides the Darwin Ktor engine and
`MainViewController()` (the Compose entry point). The framework builds with:

```bash
cd ..    # frontend/app/compose
./gradlew linkDebugFrameworkIosSimulatorArm64
```

## Run on the simulator

Prereqs (one-time):
- An **iOS Simulator runtime** — Xcode ▸ Settings ▸ Platforms ▸ install an iOS runtime.
- **xcodegen** — `brew install xcodegen` (used to generate the `.xcodeproj` from `project.yml`).

Then:
```bash
cd iosApp
xcodegen generate        # creates iosApp.xcodeproj from project.yml
open iosApp.xcodeproj     # in Xcode: pick an iPhone simulator and press Run
```

The Xcode build runs `./gradlew :embedAndSignAppleFrameworkForXcode` automatically (pre-build
script) to build & embed the right framework variant.

The simulator reaches your Mac's `localhost`, so a backend on `http://localhost:8592` works as-is.
For a physical device, change `baseUrl` in `src/iosMain/.../MainViewController.kt` to the Mac's LAN IP.
