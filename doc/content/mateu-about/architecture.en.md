---
title: "Architecture"
weight: 16
---

Mateu's architecture is exceedingly simple: just a static frontend component which talks to the backend using an exceedingly simple API.

The following diagram gives the architecture overall view:

<p align="center"><img src="../../../images/arch-overall-1.svg" width="500"/></p>

The good point about being so simple is that you can easily build your own frontend and backend artifacts in order to, e.g. use your own design system while leveraging the existing Mateu's backend libraries.

## Artifacts

Mateu is divided in 3 main artifact types: frontends, the API, and server side libraries implementing that api.

And the following diagram explains the diferent artifacts that Mateu provides:

<p align="center"><img src="../../../images/arch-overall-2.svg" width="300"/></p>

## The API

The API is a pretty simple one, and is explained with the following sequence diagram:

<p align="center"><img src="../../../images/arch-overall-3.svg" width="500"/></p>

(right click on the image and open it in a new tab for enlarging it)

The api spec is available here: http://demo.mateu.io/webjars/swagger-ui/index.html

## What happens in the server side

Mateu basically generates controllers for your server side classes annotated with `@MateuUI`, which mainly provide 2 things:

- Serve the static content (index.html and mateu.js) for instantiating the renderer web component in the browser
- Implement the API the frontend consumes, connecting it to your server-side objects which define your UI


