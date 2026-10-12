---
title: "Renderers"
description: "Where a Mateu UI renders — Vaadin and Oracle Redwood / Visual Builder on the web, the Mateu mobile app, IntelliJ on the desktop — all from the same model."
---

A Mateu UI is a model; a **renderer** turns it into something people use. Every renderer consumes
the same wire model, so the same UI — whether it was written in YAML, Java, C# or Python, and
whether a backend or a static bundle serves it — renders in any of them without changes.

| Renderer | Where | How you choose it |
|---|---|---|
| [Vaadin](/design-systems/vaadin/) | web browser (the default) | `renderer: vaadin` in `project.yaml`, or the `mateu-vaadin` dependency |
| [Oracle Redwood / Visual Builder](/design-systems/oracle-redwood/) | web browser, standalone or **embedded in an existing Visual Builder app** | `renderer: redwood`, or the `mateu-redwood` dependency |
| [The Mateu mobile app](/native/react-native/) | iOS and Android | install the app and add the UI's address |
| [IntelliJ](/native/) | desktop, inside IntelliJ IDEA | the Mateu plugin, pointed at the UI |

For the web renderers, the project's choice lives in
[`project.yaml`](/define/yaml/project-settings/); a static bundle ships that renderer, and a served
app uses the renderer dependency on its classpath.

## Web or native?

Each renderer family serves a different goal. The same UI can be rendered by all of them at once, so you pick per deployment — or offer several.

- **Web renderers** (with multiple design systems) — best when you want a **zero-install** UI delivered through the browser, and when you need to **drop Mateu into an application you already have without breaking its UX**. Choose the design system that matches the host application — [Vaadin](/design-systems/vaadin/) or [Oracle Redwood](/design-systems/oracle-redwood/) — and the Mateu screens blend in seamlessly.
- **Native renderers** — best when you want **better performance** and an OS-native feel. The [desktop (IntelliJ plugin)](/native/) renderer runs your app inside IntelliJ IDEA and gives power users the IDE's productivity workspace — **docking, split editor tabs, Search Everywhere, keyboard-first navigation**. The [mobile (React Native)](/native/) renderer ships your app to iOS and Android.

You don't have to pick just one: the same UI can be used from a browser, from IntelliJ and from a phone at the same time.

## Web renderer artifacts

| Renderer | Design system | Dependency |
|---|---|---|
| [Vaadin](/design-systems/vaadin/) | Vaadin Lumo | `mateu-vaadin` |
| [Oracle Redwood](/design-systems/oracle-redwood/) | Oracle Redwood, on Visual Builder | `mateu-redwood` |

## Writing your own

The supported renderers are Vaadin and the Redwood/VB line — and that list is short for a reason:
four first-party renderers were built and retired, because one renderer per design system,
maintained in first person, does not survive a single maintainer.

So the useful question is not "which of ours matches your design system" but **"how cheaply can you
own yours"**. See the [renderer contract](/design-systems/renderer-contract/): what a renderer has to
implement, and the three conformance levels that tell you when you are done. Reaching **Core** is a
complete, legitimate answer.

## How to switch renderer

Replace the renderer dependency in your `pom.xml`. For example, to switch from Vaadin to Redwood:

```xml
<!-- remove -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-vaadin</artifactId>
    <version>MATEU_VERSION</version>
</dependency>

<!-- add -->
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>mateu-redwood</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

Nothing in the UI definition changes. A YAML-only project switches with `renderer:` in `project.yaml`.

## Embedding in existing UIs

Because each renderer is a web component, you can embed a Mateu UI inside any existing application — including React, Vue, Angular, or plain HTML pages — regardless of which design system that application uses.

A Vaadin-rendered Mateu component can be dropped into a React, Angular or plain-HTML page, and an Oracle Redwood one into an Oracle Cloud / Visual Builder application.

See [Embedded UI](/java-user-manual/use-cases/embedded-ui/) for details.

## Native renderers

Beyond the browser, Mateu also supports native renderers for desktop and mobile:

| Renderer | Platform | Technology |
|---|---|---|
| [Desktop (IntelliJ plugin)](/native/) | Windows, macOS, Linux (inside IntelliJ IDEA) | IntelliJ platform / Swing |
| [Mobile (React Native)](/native/) | iOS, Android | Expo / React Native |

Both native renderers consume the same wire model as the web renderers, so web, desktop and mobile users can use the same UI at the same time.

See [Native Renderers](/native/) for details.

## Bring your own

If none of the available renderers fit, you can build your own frontend that consumes the Mateu API. See [Bring your own design system](/design-systems/bring-your-own-design-system/).
