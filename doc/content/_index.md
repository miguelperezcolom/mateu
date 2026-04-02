---
title: Spec-driven development. Build UIs with minimal code.
---

# Spec-driven development

Define your UI as code — not build it by hand.

## Build full web apps with minimal code

Define your UI once. Mateu builds it and wires everything together.

**No HTML. No CSS. No JavaScript.**

No duplicated models. No API glue. No fragmented architecture.

---

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [GitHub](https://github.com/miguelperezcolom/mateu)  
👉 [Docs](https://mateu.io/java-create-your-project/springboot-mvc/)

---

## What you actually get

- forms
- tables
- layouts
- actions
- navigation

All generated from your backend code.

---

## Write this

```java
@UI("")
public class Home {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

## Get this

![ui](../../../images/counter.png)

---

## Less code. Fewer moving parts.

- one source of truth
- no duplication
- no glue code
- no sync issues

**Build the same apps with a fraction of the complexity.**

---

## Not backend-driven. Not frontend-driven.

**Defined once. Rendered automatically.**

---

## Stop splitting your app.

Define it once.

👉 [Try the demo](https://vaadin.mateu.io/fluent/use-cases/rra)

---

_Built by developers who got tired of building the same app twice._
