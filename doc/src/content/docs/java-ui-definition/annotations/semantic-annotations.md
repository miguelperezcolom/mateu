---
title: "Semantic (Composed) Annotations"
description: "Bundle field, method and class configuration into a single domain annotation."
---

A **semantic annotation** is a domain annotation of your own that bundles one or more
Mateu annotations. Instead of repeating the same configuration on every field, you
declare it once and reuse a meaningful name.

For example, a string field that holds a supplier id is normally a `@Lookup` with an
options supplier and a label supplier:

```java
@Lookup(search = ProveedorOptionsSupplier.class, label = ProveedorLabelSupplier.class)
String proveedorId;
```

Define it once as a semantic annotation:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Lookup(search = ProveedorOptionsSupplier.class, label = ProveedorLabelSupplier.class)
public @interface ProveedorId {}
```

…and use the meaningful name everywhere:

```java
@ProveedorId String proveedorId;
```

Mateu treats the field exactly as if it carried the underlying `@Lookup` (with its
attributes). It renders as a lookup combo backed by the suppliers.

## How it works

When Mateu looks for an annotation `A` on a field, method or class, it considers `A`
**present** if it sits there directly **or** transitively through another annotation
that is itself meta-annotated with `A`. This is resolved by `MetaAnnotations` and
behaves like Spring's `findMergedAnnotation` (minimal — it returns the first matching
meta-annotation; there is no attribute overriding / `@AliasFor`).

## Bundling several annotations

A single semantic annotation can meta-annotate **several** Mateu annotations; each one
is resolved independently:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@Stereotype(FieldStereotype.money)
@Label("Importe total (€)")
@Help("Importe total del pedido, IVA incluido")
public @interface ImporteTotal {}
```

```java
@ImporteTotal BigDecimal granTotal;   // money stereotype + label + helper text
```

## Field, method and class annotations

Composition works at every level.

**Method** — bundle action annotations:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Toolbar
@Label("Guardar")
public @interface AccionGuardar {}

// usage
@AccionGuardar
Object guardar(HttpRequest httpRequest) { return Message.success("Guardado"); }
```

**Class** — bundle screen-level configuration:

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Compact
public @interface PantallaCompacta {}

// usage
@UI("/pedidos")
@PantallaCompacta
public class Pedidos { /* … */ }
```

## What can be composed

Every Mateu field, method and class annotation can be used as a meta-annotation —
`@Stereotype`, `@Status`, `@Style`, `@Label`, `@Help`, `@ColumnWidth`, `@PlainText`,
`@Multiline`, `@ReadOnly`, `@Lookup`, `@Searchable`, `@Toolbar`, `@Button`, `@Banner`,
`@Fab`, `@Compact`, `@Zones`, `@Title`, … — and they can be combined freely on one
domain annotation.

:::caution[Routing annotations are not composable]
`@UI`, `@Route`, `@Routes` and `@HomeRoute` are **not** resolved through composition.
They are processed by the annotation processor at compile time, which is not
meta-annotation aware, so composing them would behave inconsistently between compile
time and runtime. Keep these directly on the class.
:::

## Writing your own composable annotation

If you add a **new** Mateu-style field/method/class annotation and want it to be
usable as a meta-annotation:

1. Add `ElementType.ANNOTATION_TYPE` to its `@Target` (so it can be placed on an
   annotation type).
2. Read it with `MetaAnnotations.find(element, X.class)` / `MetaAnnotations.isPresent(
   element, X.class)` rather than `element.getAnnotation(X.class)`.

All built-in Mateu annotations already satisfy (1) and are read through (2).
