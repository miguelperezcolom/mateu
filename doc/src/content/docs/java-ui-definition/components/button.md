---
title: "Button"
---

A clickable action element. When placed inside a `Form`'s `toolbar` or `buttons` list it sends an action to the server. When used as a standalone component inside a layout it can trigger an action by `actionId` or execute a `Runnable`/`Callable` inline.

## Basic usage

```java
Button.builder()
    .label("Do something")
    .actionId("my_action")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | String | — | Optional component ID |
| `label` | String | — | Button text |
| `iconOnLeft` | String | — | Icon name rendered before the label |
| `iconOnRight` | String | — | Icon name rendered after the label |
| `image` | String | — | Image src (alternative to icon) |
| `color` | `ButtonColor` | normal | Color theme |
| `variant` | `ButtonVariant` | — | Visual variant |
| `buttonStyle` | `ButtonStyle` | — | Style (`primary`, `tertiary`, …) |
| `size` | `ButtonSize` | — | `small`, `medium` (default), `large` |
| `autofocus` | boolean | false | Auto-focuses this button |
| `disabled` | boolean | false | Disables the button |
| `actionId` | String | — | Action identifier sent to the server on click |
| `runnable` | `Runnable` | — | Inline action (runs on the server) |
| `callable` | `Callable<?>` | — | Inline action with return value |
| `style` | String | — | Inline CSS |
| `cssClasses` | String | — | CSS class names |

## Button styles (`ButtonStyle`)

| Value | Description |
|---|---|
| `primary` | Filled / prominent button |
| `tertiary` | Borderless / text button |
| (default) | Outlined button |

## Button sizes

```java
Button.builder().label("Small").size(ButtonSize.small).build()
Button.builder().label("Default").build()
Button.builder().label("Large").size(ButtonSize.large).build()
```

## With icons

```java
Button.builder()
    .label("Back")
    .iconOnLeft(IconKey.ChevronLeft.iconName)
    .build()

Button.builder()
    .label("Next")
    .iconOnRight(IconKey.ChevronRight.iconName)
    .build()
```

## Disabled button

```java
Button.builder()
    .label("Cannot click")
    .disabled(true)
    .build()
```

## Convenience constructors

```java
// label + actionId
new Button("Save", "save_action")

// label only (actionId derived from label)
new Button("Save")

// inline Runnable
new Button("Refresh", () -> loadData())

// inline Callable (return value becomes the server response)
new Button("Calculate", () -> calculate())
```

## Toolbar vs buttons

- **toolbar** (`Form.toolbar`) — secondary actions shown top-right of the form header
- **buttons** (`Form.buttons`) — primary actions shown at the bottom of the form

```java
Form.builder()
    .toolbar(List.of(
        Button.builder().label("Export").actionId("export").build()
    ))
    .buttons(List.of(
        Button.builder().label("Save").actionId("save").buttonStyle(ButtonStyle.primary).build(),
        Button.builder().label("Cancel").actionId("cancel").build()
    ))
    ...
```
