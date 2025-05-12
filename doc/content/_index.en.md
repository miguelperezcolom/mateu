---
header_alt: true
Title: Welcome to Mateu, the distributed backend-driven UIs library
---

Long story short, **Mateu** allows you to create distributed backend driven user interfaces (UIs). Mateu is a **java** (also c# and go in the future) library for creating awesome and reliable **responsive web applications** from our java classes at speed of light.

The main idea is to build your UIs with **the fewest lines of code**. In Mateu you **only** need to know java (also c# and go in the future), so you do not need to know about html, javascript, or css to build your apps.

Mateu's UI definition domain specific language (DSL) is built by adding some interfaces, classes and annotations to the good old java language.

### Goal

Mateu is just another way of building UIs, mainly targeted to backend teams. It's specially well suited for building huge enterprise applications where the UI is distributed among several teams.

The truth is that with Mateu building a cool UI is a no-brainer for any java (c# and go in future) developer.

### Some advantages

I'd say the main advantage of using Mateu is that you empower the backend teams to easily build high quality UIs without frontend dedicated developers. 
Besides that, here are some other advantages of using Mateu for building your UI:

- Fast
- Frontend agnostic
- Allows you to truly focus on your business logic
- Highly reusable high level components
- All of the advantages of using java (statically typed language, tooling, ...) when developing your UI
- Distributed nature (micro frontend and micro service friendly)
- Embeddable everywhere (it's just web components)

### Why not just use Vaadin

While Vaadin is an excellent tool that I truly enjoy using (in fact, I'm currently leveraging Vaadin's design system for Mateu's frontend), I believe there are certain aspects that make Mateu stand out. From my perspective::

- Mateu is a higher level approach. With Vaadin you build UIs, while Mateu is focused on building apps.
- Mateu's server side is stateless, which makes it great for microservices.
- Microfrontends are first class citizens in Mateu, and they are really easy
- Mateu is designed to support many languages and many frontends. Frontend and backend are clearly decoupled so we can have several frontend implementations (web, native app, desktop, web using different design systems, ...) and several backend implementations (java, c#, go, ...) at some point in future (I hope, if I have time ;)).

### Actual status

Mateu is currently used in production for several projects, and as time goes by it becomes more useful and proofs to be a good choice for developing enterprise applications. Even for developing all of your applications, when a UI is needed.

Since May 2024 I'm working on the **version 3** which should bring many improvements (including a general clean up, more UX features and components, plenty of extension points, documentation, refactored user manual, an alternate look and feel using a different design system, ...).

I hope you like it ;)
