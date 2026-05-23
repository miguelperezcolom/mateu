---
title: "Form"
---

The high-level page container for data-entry screens. It provides a title, subtitle, toolbar buttons (top-right), primary action buttons (bottom), header, footer, and a content area.

`Form` is what a class implementing `ComponentTreeSupplier` returns from its `component()` method.

## Basic usage

```java
@Override
public Form component(HttpRequest httpRequest) {
    return Form.builder()
            .title("My Form")
            .content(List.of(
                FormLayout.builder()
                    .content(List.of(
                        FormField.builder()
                            .id("name").label("Name")
                            .dataType(FieldDataType.string)
                            .build()
                    ))
                    .build()
            ))
            .buttons(List.of(
                Button.builder().label("Save").actionId("save").build()
            ))
            .build();
}
```

## Properties

| Property | Type | Description |
|---|---|---|
| `id` | String | Optional form ID |
| `title` | String | Page / dialog title |
| `subtitle` | String | Subtitle displayed below the title |
| `toolbar` | `List<Button>` | Buttons displayed in the top-right toolbar area |
| `header` | `List<Component>` | Components placed between the toolbar and the content |
| `content` | `List<Component>` | Main body content |
| `footer` | `List<Component>` | Components placed between the content and the buttons |
| `buttons` | `List<Button>` | Primary action buttons displayed at the bottom |

## Full example

```java
Form.builder()
    .id("form_id")
    .title("User " + user.getName())
    .subtitle("Edit profile")
    .toolbar(List.of(
        Button.builder().label("Refresh").actionId("refresh").build()
    ))
    .header(List.of(
        new Notification("Fill in all required fields")
    ))
    .content(List.of(
        FormLayout.builder()
            .autoResponsive(true)
            .content(List.of(
                FormField.builder()
                    .id("name").label("Name")
                    .dataType(FieldDataType.string).required(true)
                    .initialValue(user.getName())
                    .build(),
                FormField.builder()
                    .id("email").label("Email")
                    .dataType(FieldDataType.string)
                    .stereotype(FieldStereotype.email)
                    .initialValue(user.getEmail())
                    .build()
            ))
            .build()
    ))
    .footer(List.of())
    .buttons(List.of(
        Button.builder().label("Save").actionId("save").build(),
        Button.builder().label("Cancel").actionId("cancel").build()
    ))
    .build()
```

## Handling actions

Implement `ActionHandler` on the same class to receive button clicks:

```java
public class MyForm implements ComponentTreeSupplier, ActionHandler {

    String name;

    @Override
    public Form component(HttpRequest httpRequest) { ... }

    @Override
    public boolean supportsAction(String actionId) {
        return true;
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("save".equals(actionId)) {
            // persist data
        }
        return new State(this); // return updated state
    }
}
```

## Triggering an action on load

Implement `TriggersSupplier` to run an action when the form first loads:

```java
@Override
public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(new OnLoadTrigger("load_data"));
}
```
