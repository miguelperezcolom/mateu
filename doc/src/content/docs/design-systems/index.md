---
title: "Design Systems"
description: "Choose a frontend renderer for your Mateu application."
---

Mateu separates UI definition (your Java backend) from UI rendering (the frontend). You choose which design system renders your UI by adding a single Maven dependency.

All renderers consume the same Mateu API, so you can switch or support multiple renderers without changing your Java code.

## Available renderers

| Renderer | Design system | Dependency |
|---|---|---|
| [Vaadin](/design-systems/vaadin/) | Vaadin Lumo | `vaadin-lit` |
| [Red Hat](/design-systems/redhat/) | Red Hat PatternFly | `redhat-lit` |
| [SAP Fiori](/design-systems/sapui5/) | SAP Fiori / UI5 | `sapui5-lit` |
| [Oracle Redwood](/design-systems/oracle-redwood/) | Oracle Redwood | `redwood-lit` |
| [Salesforce SLDS](/design-systems/slds2/) | Salesforce Lightning | `slds2-lit` |

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

## Bring your own

If none of the available renderers fit, you can build your own frontend that consumes the Mateu API. See [Bring your own design system](/design-systems/bring-your-own-design-system/).
