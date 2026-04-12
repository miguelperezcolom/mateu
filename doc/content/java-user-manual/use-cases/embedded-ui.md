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
  <script type="module" crossorigin src="https://cdn.jsdelivr.net/npm/mateu-vaadin/dist/assets/mateu-vaadin.js"></script>
</head>
<body>

<h1>This is my app</h1>

<h4>The counter below is embedded from a remote Mateu app</h4>

<mateu-ui baseUrl="https://demo.mateu.io/counter"></mateu-ui>

<h4>This is my footer</h4>

</body>
</html>
```

---

## Result

![Embedded Mateu UI](/images/docs/embedded/embedded-counter.png)
