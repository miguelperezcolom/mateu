---
title: "Key interfaces"
---

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

In real applications, this is usually a Spring bean so it can inject repositories, services, or API clients.

Typical use cases:

- remote relationships
- searchable dropdowns
- large datasets
- pageable option lists

---

## `LookupLabelSupplier`

Defines how Mateu resolves the display label for a selected id/value.

Use it with `@Lookup` or `@Searchable` when the raw value is not enough for UI rendering.

In real applications, this is usually a Spring bean.

---

## `LabelSupplier`

Provides field label text dynamically at request time, overriding any `@Label` annotation on the field. Return `null` or an empty string to fall back to the annotation or the humanized field name.

Use it when field labels depend on runtime state (e.g., the same field shows different labels depending on the value of another field).

---

## `Selector<IdType>`

Extension point for `@Searchable` fields. Implement this (typically alongside `Listing`) to define what happens when the user clicks a row in the search modal.

```java
public interface Selector<IdType> {
    SelectedItem<IdType> selected(HttpRequest httpRequest);
}
```

`selected()` must return a `SelectedItem` record containing the `id` and a `label`. The framework closes the modal and updates the annotated field with the returned id.

Combine with `LookupLabelSupplier` on the same class so the same bean handles both selection and label resolution.

---

## `UploadEnabled`

Adds a bulk-import button to a `Listing` toolbar. The uploaded file is sent to `POST /upload`; on completion the framework calls `processUpload()` with the file id returned by that endpoint.

```java
public interface UploadEnabled {
    Object processUpload(String fileId, HttpRequest httpRequest);
}
```

Return a `Message` for a synchronous summary, or use `@Action(background = true)` for large file processing. See [ListingBackend — Bulk import](/java-ui-definition/interfaces/listing-backend/#bulk-import----uploadenabled) for full examples.

---

## `Translator`

Centralises all user-visible string translation. Mateu calls `translate()` for every label, title, validation message, button text, and alert before sending them to the frontend.

```java
public interface Translator {
    String translate(String text, HttpRequest httpRequest);
}
```

The `core` module provides a default implementation backed by Java i18n (`ResourceBundle`). To override it, register a bean with higher priority (e.g., `@Primary` in Spring Boot):

```java
@Component
@Primary
public class DatabaseTranslator implements Translator {
    @Override
    public String translate(String text, HttpRequest httpRequest) {
        String locale = httpRequest.getHeaderValue("Accept-Language");
        return repo.findTranslation(text, locale).orElse(text);
    }
}
```

See [i18n](/java-user-manual/advanced/i18n/) for the full guide including caching strategies and multi-tenant patterns.

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
- dynamic option/label/selection resolution (`LookupOptionsSupplier`, `LookupLabelSupplier`, `Selector`)
- dynamic field metadata (`LabelSupplier`, `DescriptionSupplier`, `StyleSupplier`, `RequiredSupplier`, `ReadOnlySupplier`, `DisabledSupplier`, `VisibilitySupplier`)
- dependency and runtime integration
