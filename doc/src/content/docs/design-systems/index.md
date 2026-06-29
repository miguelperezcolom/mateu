---
title: "Design Systems"
description: "Choose a frontend renderer for your Mateu application."
---

Mateu separates UI definition (your Java backend) from UI rendering (the frontend). You choose which design system renders your UI by adding a single Maven dependency.

All renderers consume the same Mateu API, so you can switch or support multiple renderers without changing your Java code.

## Web or native?

Each renderer family serves a different goal. The same `@UI` backend can drive all of them at once, so you pick per deployment — or offer several.

- **Web renderers** (with multiple design systems) — best when you want a **zero-install** UI delivered through the browser, and when you need to **drop Mateu into an application you already have without breaking its UX**. Choose the design system that matches the host application — [Vaadin](/design-systems/vaadin/), [SAP Fiori](/design-systems/sapui5/), [Oracle Redwood](/design-systems/oracle-redwood/), [Red Hat PatternFly](/design-systems/redhat/), [Salesforce SLDS](/design-systems/slds2/) — and the Mateu screens blend in seamlessly.
- **Native renderers** — best when you want **better performance** and an OS-native feel. The [desktop (JavaFX)](/native/) renderer additionally gives power users a productivity workspace with **docking and tabs** — detach views into floating windows, dock them side by side, keep several screens open at once. The [mobile (React Native)](/native/) renderer ships your app to iOS and Android.

You don't have to pick just one: the identical backend can serve a web UI, a native desktop app, and a mobile app simultaneously.

## Available renderers

| Renderer | Design system | Dependency |
|---|---|---|
| [Vaadin](/design-systems/vaadin/) | Vaadin Lumo | `vaadin-lit` |
| [Red Hat](/design-systems/redhat/) | Red Hat PatternFly | `redhat-lit` |
| [SAP Fiori](/design-systems/sapui5/) | SAP Fiori / UI5 | `sapui5-lit` |
| [Oracle Redwood](/design-systems/oracle-redwood/) | Oracle Redwood | `redwood-lit` |
| [Salesforce SLDS](/design-systems/slds2/) | Salesforce Lightning (SLDS 2) | `slds-lit` |

## How to switch renderer

Replace the renderer dependency in your `pom.xml`. For example, to switch from Vaadin to Red Hat:

```xml
<!-- remove -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>vaadin-lit</artifactId>
    <version>MATEU_VERSION</version>
</dependency>

<!-- add -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>redhat-lit</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

No Java code changes are needed.

## Embedding in existing UIs

Because each renderer is a web component, you can embed a Mateu UI inside any existing application — including React, Vue, Angular, or plain HTML pages — regardless of which design system that application uses.

A Vaadin-rendered Mateu component can be embedded in an Oracle JET application. An SAP Fiori renderer can be dropped into any HTML page.

See [Embedded UI](/java-user-manual/use-cases/embedded-ui/) for details.

## Native renderers

Beyond the browser, Mateu also supports native renderers for desktop and mobile:

| Renderer | Platform | Technology |
|---|---|---|
| [Desktop (JavaFX)](/native/) | Windows, macOS, Linux | JavaFX |
| [Mobile (React Native)](/native/) | iOS, Android | Expo / React Native |

Both native renderers consume the same Mateu API as the web renderers. The same backend serves web, desktop, and mobile clients simultaneously with no code changes.

See [Native Renderers](/native/) for details.

## Bring your own

If none of the available renderers fit, you can build your own frontend that consumes the Mateu API. See [Bring your own design system](/design-systems/bring-your-own-design-system/).
