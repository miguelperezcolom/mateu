---
title: "Oracle Redwood"
description: "Mateu renderer built on Oracle's Redwood design system."
---

The Oracle Redwood renderer is built on **Oracle Visual Builder** — it renders Mateu screens with the
Redwood design system's `oj-*` components (served from Oracle's CDN) inside a Visual Builder app. Use
it when your UIs need to match Oracle Cloud applications or will be embedded inside existing Oracle
Redwood interfaces.

:::note
This is the current Redwood/Visual-Builder line. The earlier standalone Oracle JET renderer
(`redwood-oj`) has been [retired](/design-systems/renderer-contract/).
:::

<p align="center"><img src="../../../images/oracle_redwood_1.webp?raw=true" width="200"/></p>

<p align="center"><img src="../../../images/basic-form-redwood.png?raw=true" width="600"/></p>

**Demo:** https://redwood.mateu.io/

Redwood's RDS toolkit standardizes full-page **templates** (Collection Detail, General Overview,
Guided Process, Create and Edit — Drawer…). Mateu builds those templates from the backend — see
the [page templates map](/ux-patterns/page-templates/) for the template → archetype mapping.

## Add to your project

```xml
<dependency>
    <groupId>io.mateu</groupId>
    <artifactId>redwood</artifactId>
    <version>MATEU_VERSION</version>
</dependency>
```

## Characteristics

- Modern Oracle Cloud look and feel
- Designed for data-dense enterprise UIs
- UX patterns alignment with Oracle Fusion applications is planned for a future release

## Related

- [Design systems overview](/design-systems/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
