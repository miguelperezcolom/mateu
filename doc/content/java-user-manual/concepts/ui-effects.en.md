---
title: "UI effects"
weight: 6
aliases:
  - /java-user-manual/ui-effects/
---

# UI effects

When an action runs on the backend, Mateu needs to know what should happen in the browser.

The return value of an action method controls this. Mateu inspects what the method returns and applies the corresponding browser-side effect.

---

## Message (toast notification)

Return a `Message` to show a toast notification to the user.

```java
@Button
public Message greet() {
    return new Message("Hello " + name);
}
```

The default `Message(String text)` constructor shows a success notification in the center of the screen for 5 seconds.

### Full builder

```java
return Message.builder()
    .variant(NotificationVariant.warning)
    .position(NotificationPosition.bottom)
    .title("Watch out")
    .text("Something unexpected happened")
    .duration(8000)
    .build();
```

### Notification variants

| `NotificationVariant` | Appearance |
|---|---|
| `success` | Green (default) |
| `warning` | Yellow |
| `error` | Red |
| `primary` | Blue |
| `contrast` | Dark |

---

## State (refresh the form)

Return `State(this)` to push the current ViewModel state back to the browser and refresh the form.

```java
@Button
Object save() {
    userRepository.save(new User(id, name, email, roles));
    return List.of(
            new Message("User saved"),
            new State(this)
    );
}
```

`State(this)` tells Mateu: re-render the form with the current field values.

Use this when:
- an action mutates fields in the ViewModel
- you want the browser to reflect those changes without a full page reload

---

## URI (navigate)

Return a `URI` to navigate the user to a different route.

```java
@Toolbar
@Action(validationRequired = true)
Object create() {
    var businessKey = UUID.randomUUID().toString();
    return URI.create("/workflow/processes/" + businessKey + "?returnTo=/controlPlane/releases");
}
```

This works the same as a browser redirect — the user is taken to the specified URL.

---

## UICommand (explicit browser control)

`UICommand` gives explicit control over browser-side actions.

```java
// Navigate to a route
return UICommand.navigateTo("/users");

// Trigger another action by id
return UICommand.runAction("search");

// Push a URL to browser history without navigating
return UICommand.pushStateToHistory("/users?page=2");
```

### Available command types

| Factory method | Effect |
|---|---|
| `UICommand.navigateTo(route)` | Navigate to the given route |
| `UICommand.runAction(actionId)` | Trigger another action by its id |
| `UICommand.pushStateToHistory(url)` | Push URL to browser history |

---

## Returning another ViewModel (open a page)

Return an instance of another ViewModel to open it as the next screen.

```java
public Object compare(ChangeRow row) {
    var result = new ComparisonResult(...);
    return new ComparisonResultPage(result);
}
```

Mateu renders the returned object as a new page or section, depending on context.

---

## Combining multiple effects

Return a `List<?>` to apply several effects in one response.

```java
@Button
Object save() {
    repository.save(entity);
    return List.of(
            new Message("Saved successfully"),
            new State(this)
    );
}
```

The effects are applied in order:
1. Toast notification is shown
2. Form is refreshed with the current state

Any combination of `Message`, `State`, `UICommand`, and `URI` can be returned in a list.

---

## Summary table

| Return type | Effect |
|---|---|
| `Message` | Show a toast notification |
| `State(this)` | Refresh form with current ViewModel state |
| `URI` | Navigate to the given URL |
| `UICommand.navigateTo(...)` | Navigate programmatically |
| `UICommand.runAction(...)` | Trigger another action |
| Another ViewModel | Open that page/section |
| `List<?>` | Apply multiple effects |
| `void` / `null` | No browser-side effect |

---

## Mental model

- actions are backend methods
- their return value controls what the browser does
- `Message` = feedback to the user
- `State` = refresh the form
- `URI` / `UICommand` = navigation or browser control
- returning another ViewModel = open a new screen
- multiple effects = return a `List<?>`

---

## Next

- [Action behavior](/java-user-manual/concepts/action-behavior/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Rules](/java-user-manual/advanced/rules/)
