---
title: "Embed"
weight: 30
---

Mateu frontend reference implementation uses web components, so you only need to add the script and use the web component in your page. Something like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>This is a demo</title>
    <script type="module" src="https://unpkg.com/mateu-ui/dist/assets/mateu.js"></script>
</head>
<body>
    <mateu-ui baseUrl="https://explorer.mateu.io">
    </mateu-ui>
</body>
</html>
```

That would embed the whole UI in any website, and control the browser url. If you want to embed only a form or crud you can do it with the following snippet:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>This is a demo</title>
    <script type="module" src="https://unpkg.com/mateu-ui/dist/assets/mateu.js"></script>
</head>
<body>
    <mateu-ux journeytypeid="forms_returnsResult"
                     baseurl="https://explorer.mateu.io">
        
    </mateu-ux>
</body>
</html>
``` 

In the end they are just web components, so you can place them wherever you want.

## mateu-ui

TBD description, properties and events

## mateu-ux

TBD description, properties and events

## Available frontends

TBD vaadin, sapui5, redwood and redhat jsdeliver/unpkg urls.


## Performance considerations

Please notice that the bundle weights something like 400KB which, at my home, takes 168ms to download but it can take more time when using a slow connection so you will perhaps want to preload it from a login page or similar in order to avoid blank page times. You can also add a spinner in the html and it would disappear when the javascript is loaded.

