---
title: "Code signing policy"
description: "Who builds, reviews and approves the signed Mateu binaries, what is signed on Windows and on macOS, and what the desktop app sends over the network."
---

Free code signing provided by [SignPath.io](https://about.signpath.io), certificate by [SignPath Foundation](https://signpath.org).

This page covers the **Windows installer of the Mateu desktop app**
(`mateu-desktop-<version>-windows-setup.exe`, on the
[GitHub releases](https://github.com/miguelperezcolom/mateu/releases)). How to check every other
artifact Mateu publishes (jars, packages, the macOS app, the Android APK) is on
[Verify what you download](/reference/verify-downloads/).

## What is signed

- Only the setup `.exe` that Mateu builds is signed through SignPath.
- The IntelliJ IDEA Open Source binaries inside it are JetBrains' own, downloaded from the
  [JetBrains/intellij-community](https://github.com/JetBrains/intellij-community) releases and
  checked against a pinned SHA-256. They keep **JetBrains'** signature and are never re-signed with
  Mateu's: the release workflow fails if that signature does not survive the packaging.
- Every signed file is built from source by GitHub Actions (`.github/workflows/desktop.yml`, called by
  the release workflow after the release's tests pass) from a tagged commit of
  [miguelperezcolom/mateu](https://github.com/miguelperezcolom/mateu). Nothing built on a developer's
  machine is signed. Each release file also carries a
  [build provenance attestation](/reference/verify-downloads/#build-provenance-attestations-any-file).
- Mateu is licensed under [Apache-2.0](https://github.com/miguelperezcolom/mateu/blob/master/LICENSE.txt);
  the app contains no proprietary component.

## Team roles

- **Committers and reviewers:** [Miguel Pérez Colom](https://github.com/miguelperezcolom). Every
  change goes through a pull request (`master` is protected), and a change from anyone else is
  reviewed by him before it is merged.
- **Approvers:** [Miguel Pérez Colom](https://github.com/miguelperezcolom), the repository owner.
  Every signing request is approved by hand on SignPath before the release is published.

Every team member uses multi-factor authentication on GitHub and on SignPath.

## Privacy policy

The Mateu desktop app collects no telemetry and sends no usage statistics. It connects to other
systems only for these reasons:

- **The Mateu UIs you add or open.** The app talks to the servers of those UIs, and to the sign-in
  provider a UI names when you sign in to it. What those servers do with your data is up to whoever
  runs them.
- **Its own updates.** Shortly after it starts, and then every 12 hours, it reads Mateu's update
  feed on GitHub
  (`https://github.com/miguelperezcolom/mateu/releases/latest/download/mateu-desktop-update.json`)
  and, when there is a newer version, downloads it from the same releases. The request carries
  nothing about you or your UIs. A white-label build can point at its own feed or switch updates
  off ([Updates](/native/desktop-app/#updates)).

IntelliJ's own update checks and plugin update checks are switched off in the app, and it never asks
for consent to send IntelliJ usage statistics, so none are sent. The optional AI-agent (MCP) server
is off by default and, when switched on, listens on `127.0.0.1` only.

To report a problem with a signed file, see [SECURITY.md](https://github.com/miguelperezcolom/mateu/blob/master/SECURITY.md).
