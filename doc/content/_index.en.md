---
header_alt: true
title: Build full web apps from your backend code
<meta name="description" content="Mateu is an open-source backend-driven UI framework that lets you build complete web apps using only Java — no HTML, CSS, or JavaScript.">
<meta property="og:title" content="Mateu – Build full web apps from your backend code">
<meta property="og:description" content="Create complete, responsive UIs with Java. No HTML, CSS, or JavaScript required.">
<meta property="og:image" content="https://mateu.io/og-image.png">
---

# Build full web apps from your backend code

**Mateu** is an open-source framework that lets backend developers build complete, responsive web applications using only backend code.

**No HTML. No CSS. No JavaScript.**

Design screens, define workflows, and ship production-ready UIs directly from Java — with support for C# and Python planned.

<div style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
  <a href="https://vaadin.mateu.io/fluent/use-cases/rra"><strong>🚀 Try the live demo</strong></a>
  <a href="https://github.com/miguelperezcolom/mateu">View GitHub</a>
  <a href="https://mateu.io/java-create-your-project/springboot-mvc/">Read the docs</a>
</div>

---

## Why developers like Mateu

- 🚀 **Build faster** with less code
- 🧠 **Stay in the backend** and avoid context switching
- 🎯 **Focus on business logic**, not frontend plumbing
- 🧩 **Use high-level UI components** instead of building screens by hand
- 🌐 **Designed for stateless and distributed architectures**
- 🔌 **Deliver UIs as web components** and embed them anywhere

---

## Write backend code. Get a real UI.

With Mateu, you define your UI using plain Java classes, annotations, and familiar backend patterns.

This code:

```java
package com.example.demo.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.UI;

@UI("")
@Style(StyleConstants.CONTAINER)
public class Home {

  @ReadOnly
  int count = 0;

  @Button
  Runnable increment = () -> count++;

}
```

Becomes this:

<p align="center"><img src="../../../images/counter.png" width="700"/></p>

---

## What makes Mateu different

Most frameworks help you build UI components.

**Mateu helps you build the whole application from the backend.**

It gives backend developers a simple way to define screens, actions, navigation, workflows, and application structure without creating a separate frontend layer.

That means:

- fewer moving parts
- less duplicated logic
- faster iteration
- simpler maintenance

---

## Mateu vs Vaadin

Vaadin is a great framework, and Mateu actually builds on ideas we like from its design system. But the goal is different.

| Feature                    | Vaadin                           | Mateu                                              |
|----------------------------|----------------------------------|----------------------------------------------------|
| **Primary focus**          | UI components                    | Full application structure                         |
| **Architecture**           | Stateful                         | Stateless                                          |
| **Microservices fit**      | Limited                          | Designed for distributed systems                   |
| **Frontend model**         | Coupled                          | Decoupled and swappable                            |
| **Microfrontend support**  | Indirect                         | First-class                                        |
| **Language support**       | Java only                        | Java now, C# and Python planned                    |

If you want to build modern business applications from the backend with minimal frontend overhead, Mateu takes a different path.

---

## Built for modern backend teams

Mateu is a strong fit if you want to:

- build internal tools faster
- create CRUD-heavy business apps
- keep UI logic close to domain logic
- work with stateless services and microservices
- avoid maintaining a separate frontend stack

---

## Current status

## Mateu v3 is in development

Since May 2024, Mateu v3 has been evolving toward a cleaner and more flexible architecture, including:

- a more modular design
- improved UX components
- more extension points
- updated documentation
- support for alternate design systems

Mateu is actively evolving, and early adopters are welcome.

---

## Ready to build smarter UIs?

Build complete web apps from your backend code — faster, with less complexity, and without a separate frontend layer.

👉 [**Try the live demo**](https://vaadin.mateu.io/fluent/use-cases/rra)  
👉 [**Check out the GitHub repo**](https://github.com/miguelperezcolom/mateu)  
👉 [**Explore the documentation**](https://mateu.io/java-create-your-project/springboot-mvc/)

---

_Built by backend developers who got tired of writing frontend._
