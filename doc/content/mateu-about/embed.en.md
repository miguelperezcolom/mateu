---
title: "Embed"
weight: 30
---

Mateu frontend reference implementation uses web components, so you only need to add the script and use the web component in your page. Something like this:

```html

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Demo</title>
  <script type="module" crossorigin src="https://unpkg.com/mateu-vaadin@0.0.2/dist/assets/mateu-vaadin.js"></script>
  <link rel="stylesheet" crossorigin href="https://unpkg.com/mateu-vaadin@0.0.2/dist/assets/index.css">
</head>
<body>
<mateu-ui baseUrl="https://demo.mateu.io/fluent"
          style="width: 100%; height: 100vh;"
>
</mateu-ui>

<script>
  if (window.matchMedia) {
    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.setAttribute('theme', 'dark')
    } else {
      document.documentElement.setAttribute('theme', 'light')
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      document.documentElement.setAttribute('theme', e.matches?'dark':'light')
    });
  }
</script>

</body>
</html>

```

That would embed the whole UI in any website, and control the browser url. If you want to embed only a form or crud you can do it by adding the 
**route** attribute, like in the following snippet:

```html

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Demo</title>
  <script type="module" crossorigin src="https://unpkg.com/mateu-vaadin@0.0.2/dist/assets/mateu-vaadin.js"></script>
  <link rel="stylesheet" crossorigin href="https://unpkg.com/mateu-vaadin@0.0.2/dist/assets/index.css">
</head>
<body>
<mateu-ui baseUrl="https://demo.mateu.io/fluent"
          config='{"tenantId": "1111","profile": "dev"}'
          route="/forms/counter1"
          style="width: 100%; height: 100vh;"
>
</mateu-ui>

<script>
  if (window.matchMedia) {
    if(window.matchMedia('(prefers-color-scheme: dark)').matches){
      document.documentElement.setAttribute('theme', 'dark')
    } else {
      document.documentElement.setAttribute('theme', 'light')
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      document.documentElement.setAttribute('theme', e.matches?'dark':'light')
    });
  }
</script>

</body>
</html>
``` 

In the end they are just web components, so you can place them wherever you want.

## mateu-ui

The **mateu-ui** element is the web component for the renderer. It's a web component, so you can embed it anywhere.

**mateu-ui** has the following properties:


| Property          | Description                                                             | Notes                                                  |
|-------------------|-------------------------------------------------------------------------|--------------------------------------------------------|
| **baseUrl**       | base url for the api                                                    |                                                        |
| **route**         | a route inside that ui                                                  | applies if you only want a route inside an existing ui |
| **top**           | if **true** the browser location will be managed by this component      |                          |
| **config**        | this content will be sent to the server side inside the appState object |                                              |


## Available frontends

TBD vaadin, sapui5, redwood and redhat jsdeliver/unpkg urls.


## Performance considerations

Please notice that the bundle weights something like 400KB which, at my home, takes 168ms to download but it can take more time when using a slow connection so you will perhaps want to preload it from a login page or similar, like below, in order to avoid blank page times. You can also add a spinner in the html and it would disappear when the javascript is loaded.

```html
<link rel="prefetch" href="https://app.unpkg.com/mateu-vaadin@0.0.2/files/dist/assets/mateu-vaadin.js" as="script" />
```
