# State, actions and fields


Mateu models UI using three core concepts:

## State
Fields define UI state.

```java
String name;
```

→ becomes an input field.

## Actions
Methods define behavior.

```java
@Button
public Message greet() {
  return new Message("Hello " + name);
}
```

## Result

State + actions = full UI.

Mateu generates forms, buttons and interactions automatically.

