---
title: "Embedded UI"
weight: 4
---

# Embedding Mateu UI in any frontend

Use Mateu inside any existing application.

---

## Minimal example

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Users home</title>
  <script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/mateu-vaadin/dist/assets/mateu-vaadin.js"></script>
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

---

## Result

![Embedded Mateu UI inside a host page](/images/docs/embedded/embedded-counter.png)

---

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
