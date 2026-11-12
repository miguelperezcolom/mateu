---
title: "The Mateu app: any Mateu UI on your phone"
description: "One free app for iPhone and Android that opens any UI built with Mateu, natively: add it by scanning a QR code, tapping a link or typing its address. No account, nothing to build per UI."
---

The **Mateu app** is one free app for iPhone and Android that opens **any UI built with Mateu** —
yours or anybody's — as a native phone app. You add UIs to it the way an authenticator app adds
accounts: scan a QR code, tap a link or type an address. Nobody builds or publishes an app per UI,
and the UI's server needs no changes: the same backend that serves the web serves the phone.

## Get the app

| Phone | Where |
|---|---|
| **iPhone / iPad** | [App Store](https://apps.apple.com/app/mateu/id6829227403) |
| **Android** | Google Play is in its closed test: [become a tester](/native/android-testers/) and install it from Play, or install the `-android.apk` file from the [latest release](https://github.com/miguelperezcolom/mateu/releases/latest) |

The app asks for no sign-up and no Mateu account.

## Add a UI

Any of these adds a UI to your list (**My UIs**):

- **Scan its QR code.** Tap **Add a UI** and point the camera at the code. Every Mateu web UI can
  show one (**Open on mobile**), and so do the Mateu IDE plugins for an app running on your computer.
- **Tap a link** of the form `https://mateu.io/add?u=<address>` on the phone: it opens the app on the
  confirmation screen. Without the app, the link shows where to get it.
- **Type its address.** **Add a UI** › **Type an address instead**, then the UI's address, for example
  one of the demos:
  - `museums.ec1.mateu.io` — three museums' collections: artists, works, exhibitions, loans.
  - `space.ec1.mateu.io` — a space-themed demo.

Before adding, the app shows the UI's **domain** first and biggest — its name and icon under it — and
adds nothing you did not confirm.

## Use it

- **My UIs** is your list: open one with a tap; move, remove or reorder them from a row's **⋮** button
  or a long press. The **⇄** button in an open UI's top bar goes back to the list.
- An open UI is drawn natively (Material Design 3): its menu, forms,
  listings, boards, wizards and dashboards are the UI's own, the same screens the web shows.
- A UI that needs a sign-in asks for it the first time, with its own sign-in page (OpenID Connect).
  Each UI keeps its own session, and **Sign out** signs you out of that one only.
- A UI opened before opens from what the phone kept and refreshes it in the background, so it starts
  fast even on a slow connection.
- **Export my UIs** gives a QR code with your list, to move it to another phone. It carries the
  addresses only — never a password or a session.

## Safe by design

A Mateu QR code or link carries **only an address**, never a password, a token or a session: a
photographed or forwarded code grants nothing, at worst it adds an entry to someone's list. You sign
in inside the app, on the UI's own sign-in page. The list of UIs lives on your phone.

## For people who build Mateu UIs

Your UI can be opened in the app with no extra work: every Mateu backend serves the small manifest the
app reads (name, icon, colours, sign-in), and web UIs offer **Open on mobile** with the QR code. To share
a UI, share its address, its QR code or an `https://mateu.io/add?u=…` link.

- How it works, the manifest and the "Open on mobile" button: [Open on mobile (QR)](/ux-patterns/mobile-app/).
- The same app on the desktop (macOS, Windows, Linux): [the Mateu desktop app](/native/desktop-app/).
- Your own branded app, bound to one UI, in the stores: [Publishing to the App Store and Google Play](/deploy/mobile-app-stores/).
- The renderer behind it: [React Native renderer](/native/react-native/).
