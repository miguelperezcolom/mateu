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

:::caution[Oracle licensing]
The renderer's own code is Mateu's (Apache 2.0) and the jar **vendors nothing from Oracle**. At run
time it loads from Oracle's CDN:

- **Oracle JET and the Redwood theme** — open source, [UPL 1.0](https://www.oracle.com/downloads/licenses/upl-license1.html).
- **The Spectra components (`oj-sp-*`), the Visual Builder runtime and Oracle's icon/illustration
  gallery** — Oracle's property, **not** open source. Their use is governed by **your own Oracle
  terms** (typically the Visual Builder entitlement of an Oracle Cloud subscription). Mateu grants
  no rights over them.

Think of this renderer as a connector: the code is free; the service it connects to is not. Using it
outside an Oracle subscription is a question for your Oracle agreement, not for Mateu's licence. The
full statement ships in the jar as `META-INF/NOTICE.md` (and in the repository under
`frontend/web/monorepo/apps/redwood/`). Oracle, Oracle JET, Redwood and Visual Builder are
trademarks of Oracle and/or its affiliates; Mateu is not affiliated with or endorsed by Oracle.
:::

![A form rendered by the Redwood renderer](/images/docs/design-systems/basic-form-redwood.png)

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
- Builds the RDS page templates (Smart Search, Collection Detail, General Overview, Guided Process…) from the same archetypes as every other renderer

## Related

- [Design systems overview](/design-systems/)
- [Embedded UI](/java-user-manual/use-cases/embedded-ui/)
