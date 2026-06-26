---
title: "Build Your Domain Vocabulary"
description: "Turn Mateu's generic API into a DSL that speaks your domain — with semantic annotations, component adapters and custom suppliers."
---

Mateu's annotations and interfaces are deliberately generic — `@Lookup`, `@Stereotype`,
`ComponentTreeSupplier`, `StateSupplier`… They describe *UI mechanics*, not *your domain*.

On a real codebase you repeat the same mechanics over and over: every supplier id is the
same `@Lookup`, every amount is the same `@Stereotype(money) @Label @Help`, every legacy DTO
needs the same wiring. The cure is to build a thin **semantic layer** on top of Mateu — a
small vocabulary that names the concepts of *your* domain and hides the mechanics behind them.

This page frames the three mechanisms that let you do that and **when to reach for each**.
Each links to its reference page for the full detail.

## Which mechanism?

| You want to… | Use | Reference |
|---|---|---|
| Re-label / bundle existing Mateu configuration under a domain name | **Semantic (composed) annotation** | [Semantic Annotations](annotations/semantic-annotations/) |
| Render an object that is **not** a Mateu component (a plain/legacy model) and round-trip it | **`ComponentAdapter`** | [ComponentAdapter](interfaces/component-adapter/) |
| Take full control of the component tree, the state, or the option lists | **Custom suppliers** | [ComponentTreeSupplier](interfaces/component-tree-supplier/), [StateSupplier](interfaces/state-supplier/), [DataSupplier](interfaces/data-supplier/) |

The three compose: an adapter can return components that use your semantic annotations; a
supplier can back a field that a semantic annotation declares. Start with the lightest one
that fits.

## 1. Semantic annotations — name your configuration

When the same combination of Mateu annotations appears again and again, fold it into one
domain annotation. A supplier-id field is normally:

```java
@Lookup(search = ProveedorOptionsSupplier.class, label = ProveedorLabelSupplier.class)
String proveedorId;
```

Define the concept once and reuse the meaningful name:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Lookup(search = ProveedorOptionsSupplier.class, label = ProveedorLabelSupplier.class)
public @interface ProveedorId {}

// everywhere:
@ProveedorId String proveedorId;
```

One annotation can bundle several (`@Stereotype(money) @Label @Help`), and it works on
fields, methods and classes. This is the **lightest** option — no new code paths, just a
name. → [Semantic Annotations](annotations/semantic-annotations/)

## 2. Component adapters — adopt foreign models

A semantic annotation still assumes the object *is* a Mateu form. When the object is a plain
domain/legacy model with **no Mateu annotations** — or one you can't or don't want to annotate
— register a `ComponentAdapter<T>` that defines its whole UI and rebuilds it from state:

```java
@Service
public class PedidoAdapter implements ComponentAdapter<Pedido> {
  public Class<Pedido> type() { return Pedido.class; }
  public AdaptedView adapt(Pedido p, HttpRequest r) { /* components + state + actions */ }
  public Pedido deserialize(Map<String, Object> state, HttpRequest r) { /* rebuild */ }
}
```

The model renders both as a top-level route and as a nested field (an independent island with
its own state and actions). → [ComponentAdapter](interfaces/component-adapter/)

## 3. Custom suppliers — control the mechanics

When even an adapter is too coarse and you need to shape the raw output, implement the
supplier interfaces directly: a `ComponentTreeSupplier` to emit an arbitrary component tree
for a route, a `StateSupplier` to decide exactly what state is sent to the client, a
`DataSupplier`/options supplier to feed lookups and grids. These are the building blocks the
two mechanisms above are built on, exposed for when you need them. →
[Interfaces reference](interfaces/)

## A note on routing

Routing annotations (`@UI`, `@Route`, `@Routes`, `@HomeRoute`) are **not** part of the
semantic layer — they are resolved by the annotation processor at compile time, which is not
meta-annotation aware. Keep them directly on your classes; everything else above is
runtime-resolved and composable.
