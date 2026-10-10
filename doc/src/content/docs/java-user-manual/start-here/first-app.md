---
title: "First app"
---

This tutorial is a slower introduction than the quickstart.

If you want to build something real first, go to the [Quickstart](/java-user-manual/start-here/quickstart/).

---

## 1. Create a UI class

```java
@UI("")
@Title("My first Mateu app")
@Style(StyleConstants.CONTAINER)
public class Home {
}
```

This defines a screen at the root path (`/`) with a title and a container-style layout.

:::note[In a generated project]
The generated project already has a screen at the root (`Products`, `@UI("")`), and two `@UI`
classes cannot share a path — the build fails saying so. Give this one its own path,
`@UI("/hello")`, and open http://localhost:8080/hello.
:::

---

## 2. Add state

```java
String name;
```

Mateu uses fields as UI state.

This automatically creates a text input field in the UI.

---

## 3. Add validation

```java
@NotEmpty
String name;
```

Validation annotations are reflected directly in the UI.

Now the field is required.

---

## 4. Add an action

```java
@Button
public Message greet() {
  return new Message("Hello " + name);
}
```

Actions define behavior.

This creates a button that:

- reads the current state (`name`)
- executes the method
- shows the returned message

---

## The whole class

With its imports (`@Button` is the annotation in `io.mateu.uidl.annotations`, not the
`io.mateu.uidl.data.Button` record your IDE may offer first):

```java
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

@UI("")
@Title("My first Mateu app")
@Style(StyleConstants.CONTAINER)
public class Home {

  @NotEmpty String name;

  @Button
  public Message greet() {
    return new Message("Hello " + name);
  }
}
```

---

## Result

With just this code, Mateu generates a working UI:

- an input field for `name`
- validation from `@NotEmpty`
- a button bound to the `greet` action
- a message shown as feedback

![Result of the first app](/images/docs/first-app/result.png)

---

## What just happened?

You defined:

- state → `name`
- validation → `@NotEmpty`
- behavior → `greet()`

Mateu turned that into a complete UI automatically.

---

## Next

- [Quickstart](/java-user-manual/start-here/quickstart/)
- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
