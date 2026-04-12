---
title: "Validation"
weight: 2
aliases:
  - /java-user-manual/validation/
---

# Validation

Mateu supports standard Java Bean Validation annotations.

Validation rules defined in your backend models are automatically enforced in the UI.

## Example

```java
@NotEmpty
String name;

@Email
String email;

@Size(min = 8)
String password;
```

Mateu uses these annotations to:

- validate input in the browser
- prevent invalid submissions
- keep backend and UI validation consistent

## Why this matters

In traditional architectures, validation is duplicated:

- backend validation
- frontend validation

With Mateu:

- validation is defined once
- applied everywhere

## Mental model

Validation is part of your domain model.

Mateu propagates it to the UI automatically.
