---
title: "Salesforce Lightning (SLDS 2)"
description: "Mateu renderer built on the Salesforce Lightning Design System 2 CSS framework."
---

The Salesforce renderer is built on **SLDS 2** (`@salesforce-ux/design-system-2`, Cosmos theme) — a global CSS framework of `slds-*` classes and `--slds` styling hooks, applied to Mateu's own light-DOM markup. Use it when your UIs need to look like Salesforce or when they will be embedded inside an existing Salesforce application.

<div style="display: flex; width: 100%; align-items: center; justify-content: center;">
  <img src="https://a.sfdcstatic.com/shared/images/c360-nav/salesforce-with-type-logo.svg" width="120" style="margin-right: 10px;"/>
</div>

<p align="center"><img src="../../../images/basic-form-slds2.png?raw=true" width="600"/></p>

**Demo:** https://slds2.mateu.io/

## Add to your project

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>slds-lit</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

## Characteristics

- Matches the Salesforce Lightning (SLDS 2 / Cosmos) look and feel
- Good choice for ISVs building on the Salesforce platform
- Pure CSS framework — no Salesforce-platform runtime required

## Related

- [Design systems overview](/design-systems/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
