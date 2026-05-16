---
title: "MenuSupplier / Actionable / Submenu"
weight: 5
---

# MenuSupplier

Provides the application navigation menu. Implement on your root application class alongside `@App`.

```java
public interface MenuSupplier {
    List<Actionable> menu(HttpRequest httpRequest);
}
```

## Method

| Method | Description |
|---|---|
| `menu(httpRequest)` | Returns the list of top-level menu items |

## Usage

```java
@App(AppVariant.DRAWER)
@Route("/")
public class MyApplication implements ComponentTreeSupplier, MenuSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
        return new Text("Welcome");
    }

    @Override
    public List<Actionable> menu(HttpRequest httpRequest) {
        return List.of(
            new MenuEntry("Dashboard", "/dashboard"),
            new MenuEntry("Customers", "/customers"),
            new MenuEntry("Invoices", "/invoices")
        );
    }
}
```

---

# Actionable

Represents a navigable menu item or action link. Every item returned by `MenuSupplier.menu()` must implement this interface.

```java
public interface Actionable {
    boolean selected();
    String path();
    String label();
    Component component();
    String className();
    boolean disabled();
    boolean disabledOnClick();
    Object itemData();
    default String description() { return null; }
}
```

## Properties

| Property | Description |
|---|---|
| `label()` | Display text for the menu item |
| `path()` | URL the item navigates to when clicked |
| `selected()` | Whether this item is currently active |
| `component()` | Custom component rendered for this item (instead of a plain link) |
| `className()` | CSS class applied to the item |
| `disabled()` | Whether the item is greyed out and non-clickable |
| `disabledOnClick()` | Whether the item becomes disabled after clicking |
| `itemData()` | Arbitrary data attached to the item |
| `description()` | Optional description for AI assistants |

## Built-in implementation

Mateu provides a concrete implementation via its fluent API. You can use any class that implements `Actionable`.

---

# Submenu

Marker interface for objects that represent a submenu group. Objects implementing `Submenu` are rendered as expandable menu sections containing child `Actionable` items.

```java
public interface Submenu {}
```

## Usage pattern

```java
public record MenuGroup(String label, List<Actionable> items) implements Actionable, Submenu {
    @Override public boolean selected() { return false; }
    @Override public String path() { return null; }
    @Override public Component component() { return null; }
    @Override public String className() { return null; }
    @Override public boolean disabled() { return false; }
    @Override public boolean disabledOnClick() { return false; }
    @Override public Object itemData() { return null; }
}
```
