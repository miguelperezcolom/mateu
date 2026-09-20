---
title: Business components (the component catalogue)
description: Declare a reusable, bound composition once and reference it by name.
---

A **business component** is a reusable, BOUND composition of components you already have — a shape
plus a data source, named. The canonical example is an *agency selector*: a dropdown fed from a
specific endpoint. You declare it once and reference it by name wherever an agency must be picked,
instead of repeating the dropdown + its source at every field.

It is **not** a new kind of rendering. A business component composes pieces every renderer already
paints, so it **ports for free** and **runs with no backend** — the reference resolves against a
catalogue that travels with the app. (Contrast with a *custom component*, which is genuinely new
rendering and needs a per-renderer renderer — a different tool.)

## Declaring one

The catalogue has **two producers, one table** — the same pattern as the [REST source
catalogue](/java-ui-definition/rest-source-catalogue/) and the [route
registry](/java-ui-definition/route-registry/): declarations are merged, and an **authored entry
wins** over a derived one.

**In data** — `specs/ui/components.yaml`:

```yaml
components:
  - name: AgencySelector
    component:
      type: FormField
      stereotype: select
      # …bound to a source; see the REST source catalogue
```

**In code** — a `ComponentCatalogSupplier` bean returns entries (for a catalogue that comes from
configuration or a database):

```java
@Service
public class Catalogue implements ComponentCatalogSupplier {
  public List<ComponentEntry> businessComponents() {
    return List.of(new ComponentEntry("AgencySelector", /* the composition */));
  }
}
```

## Referencing one

Drop a `ComponentRef` wherever a component goes — in a component tree, or as the value of a
`Component`-typed field on a reflected page:

```java
@UI("/agency-form")
public class AgencyForm {
  public Component agency = new ComponentRef("AgencySelector");
  public String note;
}
```

The reference carries only the **name**. It resolves to the catalogue's composition:

- **Backend-driven** — the server substitutes the composition while rendering; the reference never
  reaches the wire.
- **No backend** (static bundle / client-side expander) — the catalogue travels on the app metadata
  (`AppDto.components`) and the browser resolves the reference the same way.

An unknown name renders a graceful placeholder, never an error.

## Business vs custom — one line

> A **business component** is a reusable BOUND composition of existing pieces → data, ports for free,
> no backend. A **custom component** is a NEW piece with its own rendering → a per-renderer escape
> hatch that does not port for free.

Reach for a business component first; it is reuse + inference, portable for free. Keep the agency
selector a business component — it is a `dropdown + source`, not a custom one.
