---
title: "SAP Fiori / UI5"
description: "Mateu renderer built on SAP UI5 and Fiori components."
---

The SAP renderer uses UI5 web components and optionally SAP Fiori components. Use it when your UIs need to look and feel like SAP applications, or when they will be embedded inside an existing SAP Fiori launchpad.

<div style="display: flex; width: 100%; align-items: center; justify-content: center;">
  <img src="../../../images/phenix_blue.svg?raw=true" width="60" style="margin-right: 10px;"/>
  <img src="../../../images/fiori.png?raw=true" width="60"/>
</div>

<p align="center"><img src="../../../images/basic-form-sapui5.png?raw=true" width="600"/></p>

**Demo:** https://sapui5.mateu.io/

## Add to your project

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>sapui5-lit</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

## Licensing note

UI5 is open source and freely available. SAP Fiori components require a valid SAP license. The Mateu SAP renderer is built primarily on UI5 components, with some Fiori components for specific patterns. A fully open-source UI5-only variant is planned.

## Related

- [Design systems overview](/design-systems/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
