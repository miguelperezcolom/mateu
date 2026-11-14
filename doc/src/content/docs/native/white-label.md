---
title: "Your own native app, without forking Mateu"
description: "Ship the Mateu desktop and mobile apps under your own name, icons and UI — build options and a reusable GitHub workflow, no fork and no code changes."
---

The native apps Mateu publishes — the desktop app for macOS, Windows and Linux, and the mobile app
for iOS and Android — are **hubs**: they open any Mateu UI the user adds. The same sources build
**your** app: your name, your icons, opening **your** UI straight away, under your own identity.
Everything is a build option; you never edit Mateu's code, so you never carry a fork.

| | Desktop | Mobile |
|---|---|---|
| How | Gradle properties of `buildInstaller`, or the reusable workflow below | Environment variables of the Expo build |
| Name | `-Pmateu.productName` | `MATEU_APP_NAME` |
| The UI it opens | `-Pmateu.baseUrl` (or `-Pmateu.registryUrl` + `-Pmateu.appId`) | `MATEU_FIXED_URL` (+ `MATEU_FIXED_ROUTE`), or `MATEU_REGISTRY_URL` + `MATEU_APP_ID` |
| Identity | `-Pmateu.bundleId` (macOS) | `MATEU_BUNDLE_ID` (iOS bundle id and Android package) |
| Icons | `-Pmateu.icon.macos` (`.icns`), `-Pmateu.icon.windows` (`.ico`), `-Pmateu.icon.linux` (`.png`) | `MATEU_APP_ICON`, `MATEU_ADAPTIVE_ICON` (+ `MATEU_ADAPTIVE_ICON_BACKGROUND`, `MATEU_MONOCHROME_ICON`), `MATEU_SPLASH_IMAGE` (+ `MATEU_SPLASH_BACKGROUND`) |
| Updates | `-Pmateu.updateUrl` (your feed, or `none`) | your own EAS project and update channel |
| Signing | your Apple Developer ID / your Windows certificate | your App Store / Play accounts |

A white-label app is a **`fixed`** build: bound to one UI, with no hub, no QR scanner, and it claims
none of the hub's links (`mateu://add`, `https://mateu.io/add`) — a branded app must never answer for
every Mateu UI a QR code points at. Whatever you leave out keeps Mateu's default.

## Desktop

### With the reusable workflow (no clone)

From **your** repository, call Mateu's `desktop-white-label.yml`. It checks out Mateu at the release
you name, builds your installers on GitHub's macOS, Linux and Windows runners, launches each one
(the Mateu plugin must start cleanly) and hands them back as artifacts of your run. It publishes
nothing anywhere.

```yaml
# .github/workflows/desktop.yml in YOUR repository
name: Desktop app
on: workflow_dispatch

jobs:
  desktop:
    uses: miguelperezcolom/mateu/.github/workflows/desktop-white-label.yml@v3.0-beta.67
    with:
      mateu-version: v3.0-beta.67        # the same release as the @ref above
      product-name: Acme Admin
      base-url: https://admin.acme.example
      icon-macos: branding/acme.icns     # paths in YOUR repository
      icon-windows: branding/acme.ico
      icon-linux: branding/acme-1024.png
      # update-url: https://downloads.acme.example/acme-admin-update.json
      # bundle-id: com.acme.admin
      # platforms: macos-aarch64,windows  # default: all four
    secrets: inherit
```

The artifacts are named after the product's slug — `acme-admin-desktop-macos-aarch64`, `…-macos-intel`,
`…-windows`, `…-linux` — and hold `acme-admin-desktop-<version>-macos-aarch64.dmg`, `…-windows-setup.exe`,
`…-linux.tar.gz` and the portable zips. Attach them to your own release with
`actions/download-artifact` + `gh release upload` in a following job.

| Input | Meaning |
|---|---|
| `mateu-version` | The Mateu release to build from (required). It needs the icon options: 3.0-beta.67 or later |
| `product-name` | The app's name (required): window title, `.app`, shortcuts, install folder, file names |
| `variant` | `fixed` (default) or `hub` — a hub of your own, with your name |
| `base-url` / `registry-url` + `app-id` | The UI a `fixed` app opens |
| `update-url` | Your update feed; empty (default) = no automatic updates |
| `bundle-id` | macOS bundle identifier (default derived from the name) |
| `icon-macos`, `icon-windows`, `icon-linux` | Your icons, as paths in your repository |
| `platforms` | Comma-separated subset of `macos-aarch64`, `macos-intel`, `windows`, `linux` |

**Signing** is yours too, through optional secrets of your repository (`secrets: inherit`). Without them
the macOS app is signed ad-hoc and the Windows setup is unsigned: Gatekeeper and SmartScreen warn on
first launch.

| Secret | For |
|---|---|
| `MACOS_CERTIFICATE_P12` (base64 of a Developer ID Application `.p12`), `MACOS_CERTIFICATE_PASSWORD`, `MACOS_SIGN_IDENTITY` | Signing the macOS app |
| `MACOS_NOTARY_APPLE_ID`, `MACOS_NOTARY_TEAM_ID`, `MACOS_NOTARY_PASSWORD` (app-specific) | Notarizing it too |
| `WINDOWS_CERTIFICATE_PFX` (base64 of a code-signing `.pfx`), `WINDOWS_CERTIFICATE_PASSWORD` | Signing the Windows setup `.exe` |

JetBrains' own binaries inside the app (the IDE launcher) keep JetBrains' signature; the workflow checks
it survives.

### With Gradle, in a checkout of Mateu

The same options as Gradle properties of `buildInstaller` (see
[the desktop app](/native/desktop-app/#two-variants-hub-or-fixed) for all of them). Build installers on **CI**, never
on a developer machine:

```bash
./gradlew buildInstaller -Pinstaller.platform=windows \
  -Pmateu.productName="Acme Admin" -Pmateu.variant=fixed \
  -Pmateu.baseUrl=https://admin.acme.example \
  -Pmateu.icon.windows=/path/to/acme.ico \
  -Pmateu.updateUrl=none
```

An icon path is absolute or relative to `frontend/app/intellij-plugin`; the build refuses a missing
file or the wrong format (`.icns` for macOS, `.ico` for Windows, a square `.png` of 512 px or more for
Linux).

### What the icons cover

- **macOS**: the `.app` (Finder, Dock, Launchpad) and the `.dmg`.
- **Windows**: the setup, the Start-menu and desktop shortcuts, and the entry in *Installed apps*.
  The **taskbar** shows the icon of the running process, `idea64.exe`, which is JetBrains' signed
  binary: it cannot be changed without breaking that signature.
- **Linux**: the menu entry (`.desktop` file) the installer writes.

## Mobile

The React Native app (`frontend/app/react-native`) reads the same choices from environment variables
when Expo builds it — `eas build`, or the release workflow's Android job. The face options apply to a
`fixed` build only; the hub keeps Mateu's.

```bash
MATEU_VARIANT=fixed \
MATEU_FIXED_URL=https://crm.acme.example \
MATEU_APP_NAME="Acme CRM" \
MATEU_BUNDLE_ID=com.acme.crm \
MATEU_APP_ICON=../../branding/acme-icon.png \
MATEU_ADAPTIVE_ICON=../../branding/acme-foreground.png \
MATEU_ADAPTIVE_ICON_BACKGROUND=#0A2540 \
MATEU_SPLASH_IMAGE=../../branding/acme-splash.png \
eas build --platform all --profile production
```

| Variable | Meaning |
|---|---|
| `MATEU_APP_ICON` | iOS icon (and the default elsewhere): a 1024 × 1024 `.png`, no transparency |
| `MATEU_ADAPTIVE_ICON` | Android adaptive icon foreground `.png` — keep the mark inside the middle two thirds (Android crops it to a circle or squircle) |
| `MATEU_ADAPTIVE_ICON_BACKGROUND` | Its background, `#rrggbb` |
| `MATEU_MONOCHROME_ICON` | Android 13+ themed icon `.png` |
| `MATEU_SPLASH_IMAGE`, `MATEU_SPLASH_BACKGROUND` | The launch screen image (`.png`) and its background colour |

Paths are relative to `frontend/app/react-native` or absolute. Store accounts, signing keys and push
credentials are yours — see [publishing to the stores](/deploy/mobile-app-stores/#hub-or-fixed-mateu_variant)
and [push notifications](/deploy/push-notifications/) (remote push exists only in a `fixed` build).

## What still needs a fork

Nothing in the list above. Changing what the apps **do** — their screens, the renderer, the
behaviour of the hub — is code, and the place for it is a contribution to Mateu rather than a fork.
