---
title: "Routing and parameters"
weight: 7
aliases:
  - /java-user-manual/routing/
---

# Routing and parameters

Mateu lets you define routes declaratively and automatically bind URL parameters to your ViewModel.

This means:

- no controllers
- no manual parsing
- no mapping layer

The URL becomes part of your UI state.

---

## Path parameters

You can define parameters directly in the route using placeholders.

```java
@Route("/example/:name")
public class ExampleParametersViewModel {

    String name;

}
```

When navigating to:

```
/example/Mateu
```

Mateu automatically sets:

```java
name = "Mateu";
```

---

## Query parameters

Mateu also maps query parameters automatically.

```java
int version;
```

When navigating to:

```
/example/Mateu?version=1
```

Mateu sets:

```java
version = 1;
```

---

## Full example

```java
@Route("/example/:name")
public class ExampleParametersViewModel {

    String name;

    int version;

    @ReadOnly
    String assessment;

    @Button
    void check() {
        assessment = "name= " + name + ", version=" + version;
    }

}
```

URL:

```
http://localhost:8080/example/Mateu?version=1
```

Result:

- `name = "Mateu"`
- `version = 1`

---

## What this enables

This approach removes an entire layer from traditional architectures.

Instead of:

- controller → parse params
- map to DTO
- pass to UI

You get:

- URL → ViewModel (directly)

---

## Mental model

- route → defines the screen
- path params → map to fields
- query params → map to fields
- ViewModel → receives everything

👉 The URL is just another input to your UI state.

---

## When to use this

Use routing and parameters when:

- you want shareable URLs
- you need deep linking
- you want to preload UI state
- you want navigation without controllers

---

## Notes

- field names must match parameter names
- Mateu handles type conversion automatically
- missing parameters use default values

---

## Next

- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Action behavior](/java-user-manual/concepts/action-behavior/)
