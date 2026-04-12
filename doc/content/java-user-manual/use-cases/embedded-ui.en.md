---
title: "Embedded UI"
weight: 3
aliases:
  - /java-user-manual/use-cases/embedded-ui/
---

# Embedding Mateu UI in any frontend

Use Mateu inside any existing application.

React, Vue, Angular, or even plain HTML.

## What this case teaches

- how Mateu can be adopted without replacing the host frontend
- how a Mateu UI can be dropped into another app with a web component
- why this is useful for gradual migration and hybrid stacks

## Minimal example

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Users home</title>
  <script
    type="module"
    crossorigin
    src="https://cdn.jsdelivr.net/npm/mateu-vaadin/dist/assets/mateu-vaadin.js">
  </script>
</head>
<body>

  <h1>This is my app</h1>

  <br><br>

  <h4>The counter below is embedded from a remote Mateu app</h4>

  <mateu-ui baseUrl="https://demo.mateu.io/counter"></mateu-ui>

  <br><br>

  <h4>This is my footer</h4>

</body>
</html>
```

## Result

![Embedded Mateu UI inside a host page](/images/docs/embedded/embedded-counter.png)

The host page is your application.  
The counter is rendered by a remote Mateu backend inside the page.

## Why this matters

This removes one of the biggest adoption barriers.

You can:

- keep the current frontend
- use Mateu for one module at a time
- migrate gradually instead of rewriting everything

## React example

```jsx
export default function UsersPage() {
  return <mateu-ui baseUrl="https://demo.mateu.io/counter" />;
}
```

## Vue example

```vue
<template>
  <mateu-ui baseUrl="https://demo.mateu.io/counter" />
</template>
```

## Why this is different from an iframe

Mateu exposes a dedicated web component for rendering the UI.

That makes embedding feel like integrating a real frontend component, not just loading another page.

## Mental model

Mateu can act as:

- a UI engine
- a remote business module
- an embeddable frontend component

## Next

- [Quickstart](/java-user-manual/get-started/quickstart/)
- [Why Mateu](/why-mateu/)
