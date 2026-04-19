---
title: "Key interfaces"
weight: 2
---

# Key interfaces

These interfaces define the most important extension points in Mateu's public DSL.

---

## `Component`

The base interface for fluent UI components.

```java
public interface Component {

  default Map<String, String> attributes() { ... }

  default Map<String, Object> properties() { ... }

  default String style() { ... }

  default String cssClasses() { ... }
}
```

Any type implementing `io.mateu.uidl.fluent.Component` can be embedded in fluent UIs and also inside declarative pages.

This is one of the key bridges between declarative and fluent Mateu.

---

## `ComponentTreeSupplier`

Use this when a class should return its UI explicitly instead of being inferred declaratively.

Use it for:

- custom pages
- advanced composition
- full fluent UIs

---

## `ContentSupplier`

Marks a type that exposes child components through `content()`.

Used in layout-like and container-like components.

---

## `ActionSupplier`

Marks a type that exposes executable actions through `actions()`.

Useful in page-like components such as the fluent `Page`.

---

## `TriggersSupplier`

Marks a type that provides a list of triggers dynamically from the request context.

Use it when triggers should not be static.

---

## `AppSupplier`

Specialized extension point for classes that return a fluent `App`.

```java
App getApp(HttpRequest httpRequest);
```

Use it when the whole application shell is produced fluently.

---

## `UISupplier`

Provides fluent UI metadata.

```java
UI getUI(HttpRequest httpRequest);
```

Useful when page metadata should be generated programmatically.

---

## `CrudRepository`

This is one of the central interfaces for CRUD-oriented Mateu applications.

Use it when Mateu should read, save, list, and delete entities through a repository abstraction.

Typical responsibilities:

- `findById`
- `save`
- `findAll`
- `deleteAllById`

---

## `LookupOptionsSupplier`

Defines how a lookup field searches available options.

Use it with `@Lookup`.

Typical use cases:

- remote relationships
- searchable dropdowns
- large datasets
- pageable option lists

---

## `LabelSupplier`

Defines how Mateu resolves the display label for a selected id/value.

Use it with `@Lookup` when the raw value is not enough for UI rendering.

---

## `BeanProvider`

Abstraction for dependency lookup.

```java
public interface BeanProvider {
  <T> T getBean(Class<T> clazz);
  <T> Collection<T> getBeans(Class<T> clazz);
}
```

This is more infrastructure-oriented, but still part of the public surface of the DSL.

---

## Mental model

Mateu interfaces mostly define extension points in four categories:

- fluent UI composition
- CRUD integration
- dynamic option/label resolution
- dependency and runtime integration
