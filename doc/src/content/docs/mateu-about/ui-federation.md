---
title: "UI federation"
---

Mateu lets multiple services contribute to a single UI.

Each service can expose:

- its own UI root
- its own menu tree
- its own CRUDs and screens

A shell application can compose those modules using `RemoteMenu`.

## What this gives you

- decentralized ownership
- centralized navigation
- no frontend integration layer
- microfrontends without a traditional frontend application

## What the shell can own

The shell can also centralize concerns such as:

- branding
- authentication
- page metadata
- shared widgets

This makes it possible to compose a distributed UI while still keeping a consistent application shell.

## The two contracts a federated shell needs

Federation works because what travels between a domain and the shell is a **declaration**, not a JS
bundle: one renderer, one framework version, no CSS collisions. But two things then have to be
agreed, and leaving them implicit is what turns a federated UI into a distributed mess.

### 1. Route ownership

Routes declared inside a mount are **relative to it**, so two domains can each have an `orders`
screen without colliding — uniqueness only has to hold *within* a mount, and between mount base
paths (two `@UI` classes claiming the same base path already fail at startup).

Within a mount, two classes claiming the same route is a bug. Mateu keeps **first-wins** — changing
it would move which class answers a route in apps that already work — but "first" depends on
classpath order, which is **not stable** between builds, or between a developer's machine and CI. So
a collision is now **reported with both class names** at startup:

```
route collision: 'orders' is claimed by com.acme.billing.Orders and by com.acme.sales.Orders.
Classpath order decides which one answers, and that order is not stable — give one of them a
different route.
```

Re-declaring the same route for the *same* class is not a collision (an index can legitimately be
read twice) and stays silent.

### 2. Version compatibility

A federated deployment mixes jars: domain A may have been built against one Mateu version and domain
B against another, while the shell runs a third.

**The policy: all the jars in one shell must be built against the same Mateu MINOR version.** Patch
differences are fine; minor differences are not supported, and nothing checks it for you today.

That is not caution for its own sake — it follows from where the coupling actually is. A domain jar
carries `@UI` classes compiled against `io.mateu:uidl` and an index written by that version's
annotation processor; the shell's core reads both. Anything that changes the wire DTOs or the index
format therefore has to be uniform, and Mateu is still `3.0-alpha`, where the wire is explicitly
allowed to move.

In practice: **bump Mateu across all your domain modules in one go.** If you cannot, keep the
straggler behind its own mount and a separate deployment rather than mixing it into a shared shell.

### Embedding outside a browser shell

The same declaration also renders inside a host that is not a Mateu shell — an IDE webview, a mobile
app, another product's page. Five things the host has to settle, and it is worth settling them
explicitly rather than per host:

| | |
|---|---|
| **Size and layout** | the host decides the viewport; the embedded UI must not assume a full page |
| **Theming** | do **not** assume the host's design tokens are present. A component that reaches for `--lumo-*` renders unstyled in an IDE webview — use your own tokens with fallbacks |
| **Authentication** | the host holds the session; the embedded UI has to be told, not discover it |
| **URL and history** | decide who owns them. Inside a webview the embedded UI usually must **not** touch browser history |
| **Events** | which events may escape to the host, and which stay inside |

Mateu does not enforce these; they are the contract you agree with the host. Getting theming wrong is
the one that bites first and looks like "the UI is broken" rather than "a variable is missing".
