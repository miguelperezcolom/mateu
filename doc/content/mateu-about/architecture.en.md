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

The artifacts in green are the one I'm currently working on.

## The API

The API is a pretty simple one, and is explained with the following sequence diagram:

<p align="center"><img src="../../../images/arch-overall-3.svg" width="500"/></p>

(right click on the image and open it in a new tab for enlarging it)

The api spec is available here: http://demo.mateu.io/webjars/swagger-ui/index.html

Please notice that the urls anatomy is intended for making it easy to route them and protect them at edge side. 

## Backend-driven frontend

In **Mateu** the frontend is backed by an ephemeral java object in the server side, like illustrated in the following diagram:

<p align="center"><img src="../../../images/arch-overall-4.svg" width="500"/></p>

On the other hand, java objects on the server side, when pushed to the frontend, become html elements (e.g. web components) 
inside the browser like in the diagram below:

<p align="center"><img src="../../../images/arch-overall-7.svg" width="600"/></p>

## What happens in the server side

Mateu basically generates controllers for your server side classes annotated with `@MateuUI`, which mainly provide 2 things:

- Serve the static content (index.html and mateu.js) for instantiating the renderer web component in the browser
- Implement the API the frontend consumes, connecting it to your server-side objects which define your UI

## What happens in the client side

This part highly depends on the implementation but, for the vaadin/lit element one, these are the main guidelines.

### Components

The UI is created using some base components, which mainly have an id, metadata, data and actions properties as shown in the following diagram:

<p align="center"><img src="../../../images/arch-client-1.svg" width="500"/></p>

Components can have children, and the communication between components is done the usual way (prop drilling and event bubbling), as shown below:

<p align="center"><img src="../../../images/arch-client-2.svg" width="500"/></p>

### Flux pattern

As per today, I'm using a rx stream for async UI updates, as shown below:

<p align="center"><img src="../../../images/arch-client-3.svg" width="500"/></p>

### Bring your own design system

For using our own design system, we could just provide a different implementation of the mateu-component web component 
and tell the UI to load the javascript, instead of the default one.


