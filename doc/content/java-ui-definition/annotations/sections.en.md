---
title: "Grouping annotations"
weight: 7
---

# Grouping annotations

These annotations group fields within a page into sections, tabs, accordions, or lists.

---

# @Section

Groups subsequent fields under a labelled section heading within a form.

```java
@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Section {
    String value();
    int columns() default 1;
    String style() default "";
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | — | Section heading label |
| `columns` | int | `1` | Number of columns inside this section |
| `style` | String | `""` | Inline CSS for the section container |

## Usage

A `@Section` annotation on a field starts a new section that contains that field and all subsequent fields until the next `@Section`.

```java
public class CustomerForm {
    @Section("Personal data")
    String firstName;
    String lastName;
    LocalDate birthDate;

    @Section(value = "Contact", columns = 2)
    String email;
    String phone;
    String address;
}
```

---

# @Tabs / @Tab

`@Tabs` placed on the class and `@Tab` on individual fields organise the form into switchable tabs.

```java
public @interface Tabs {
    String theme() default "";
    String direction() default "";
    String style() default "";
}

@Target({ElementType.FIELD, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Tab {
    String value() default "";
    int order() default 0;
}
```

## @Tabs attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `theme` | String | `""` | Visual theme variant |
| `direction` | String | `""` | Tab direction (`"horizontal"` or `"vertical"`) |
| `style` | String | `""` | Inline CSS |

## @Tab attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `value` | String | `""` | Tab label |
| `order` | int | `0` | Display order |

## Usage

```java
@UI("/account")
@Tabs
public class AccountPage {
    @Tab("Profile")
    String firstName;
    String lastName;

    @Tab("Security")
    String password;
    String mfaEnabled;

    @Tab("Preferences")
    String language;
    String timezone;
}
```

---

# @Accordion / @AccordionPanel

`@Accordion` on the class and `@AccordionPanel` on fields render the form as collapsible panels.

```java
public @interface Accordion {
    String style() default "";
    int opened() default 0;
}

public @interface AccordionPanel {
    String theme() default "";
    String style() default "";
    String summary() default "";
    boolean disabled() default false;
}
```

## @Accordion attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `style` | String | `""` | Inline CSS for the accordion container |
| `opened` | int | `0` | Index of the initially opened panel |

## @AccordionPanel attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `summary` | String | `""` | Panel header text |
| `theme` | String | `""` | Visual theme variant |
| `style` | String | `""` | Inline CSS for this panel |
| `disabled` | boolean | `false` | Whether this panel is disabled |

## Usage

```java
@UI("/settings")
@Accordion(opened = 0)
public class SettingsPage {
    @AccordionPanel(summary = "General")
    String language;
    String timezone;

    @AccordionPanel(summary = "Notifications")
    boolean emailNotifications;
    boolean smsNotifications;
}
```

---

# @List

Renders a field as an ordered or unordered list.

```java
public @interface List {
    String style() default "";
    boolean ordered() default false;
}
```

## Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `ordered` | boolean | `false` | `true` for `<ol>`, `false` for `<ul>` |
| `style` | String | `""` | Inline CSS |

## Usage

```java
public class ProductPage {
    @List(ordered = false)
    java.util.List<String> features;

    @List(ordered = true)
    java.util.List<String> installationSteps;
}
```
