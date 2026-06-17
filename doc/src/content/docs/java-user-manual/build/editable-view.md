---
title: "EditableView"
description: "A single-entity page with a read-only view and an Edit button that switches to an edit form. No list."
---

`EditableView<V, E>` is the pattern for a single record that the user can view and optionally edit — a settings page, a user profile, a tenant configuration. There is no list of records; the orchestrator always loads the same entity.

Use it when:
- There is exactly one instance of the entity (per user, per tenant, per session, …).
- You want a clean read-only view with an explicit Edit button to enter edit mode.
- You do not need create or delete operations.

---

## Routes generated

| Route | Screen |
|---|---|
| `/your-route` | Read-only view with an "Edit" button (unless `@ReadOnly`) |
| `/your-route/edit` | Edit form with "Cancel" and "Save" buttons |

---

## EditableView&lt;V, E&gt;

Full control over the view and editor types.

```java
public abstract class EditableView<V, E> extends MultiView
```

### Methods to implement

| Method | Purpose |
|---|---|
| `view(httpRequest)` | Return the object to display in read-only mode |
| `editor(httpRequest)` | Return the object to display in edit mode |
| `save(httpRequest)` | Persist the form submitted by the user |

### Example

```java
@Service
@UI("/settings")
public class SettingsPage extends EditableView<SettingsView, SettingsEditor> {

    private final SettingsService service;

    public SettingsPage(SettingsService service) {
        this.service = service;
    }

    @Override
    public SettingsView view(HttpRequest httpRequest) {
        return service.loadView();
    }

    @Override
    public SettingsEditor editor(HttpRequest httpRequest) {
        return service.loadEditor();
    }

    @Override
    public void save(HttpRequest httpRequest) {
        var form = httpRequest.getComponentState(SettingsEditor.class);
        service.save(form);
    }
}
```

---

## AutoEditableView&lt;T&gt;

Simplified variant for when both the view and the editor use the same type `T`.

```java
public abstract class AutoEditableView<T> extends EditableView<T, T>
```

### Methods to implement

| Method | Purpose |
|---|---|
| `load(httpRequest)` | Return the entity (used for both view and editor) |
| `persist(entity, httpRequest)` | Persist the submitted entity |

### Example

```java
@Service
@UI("/profile")
public class UserProfile extends AutoEditableView<UserSettings> {

    private final UserService service;

    public UserProfile(UserService service) {
        this.service = service;
    }

    @Override
    public UserSettings load(HttpRequest httpRequest) {
        var userId = httpRequest.getCurrentUserId();
        return service.loadSettings(userId);
    }

    @Override
    public void persist(UserSettings settings, HttpRequest httpRequest) {
        service.save(settings);
    }
}
```

```java
public record UserSettings(
    @NotEmpty String displayName,
    @Email String email,
    Locale language,
    ZoneId timezone
) {}
```

---

## Making it read-only

Add `@ReadOnly` to hide the Edit button entirely:

```java
@Service
@UI("/subscription")
@ReadOnly
public class SubscriptionInfo extends AutoEditableView<Subscription> {

    @Override
    public Subscription load(HttpRequest httpRequest) { ... }

    @Override
    public void persist(Subscription s, HttpRequest httpRequest) {
        throw new UnsupportedOperationException();
    }
}
```

---

## Actions

`EditableView` handles three built-in action ids:

| Action | Effect |
|---|---|
| `edit` | Navigates to the edit screen |
| `save` | Calls `save(httpRequest)`, navigates back to view, shows a success message |
| `cancel-edit` | Navigates back to view without saving |

Add custom toolbar actions on the entity class using `@Toolbar` as you would in any other screen.

---

## Next

- [AutoCrud](/java-user-manual/build/auto-orchestrators/) — when you need a list of records with CRUD operations
- [Customizing CRUD and listings](/java-user-manual/build/customizing-crud-and-listings/) — field visibility, layout, and validation
