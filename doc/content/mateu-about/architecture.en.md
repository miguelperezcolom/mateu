---
title: "Architecture"
weight: 16
---

At the highest level **Mateu**'s architecture is exceedingly simple: just a static frontend component which talks to the backend using an 
exceedingly simple API.

The following diagram gives the architecture overall view:

<p align="center"><img src="../../../images/arch-overall-1.svg" width="500"/></p>

Please notice that both the frontend and the backend components are interchangeable. You can indeed choose among
the ones provided by **Mateu** or easily build your own. E.g. you can choose to combine the **Red Hat** frontend with a 
Java **Micronaut** based backend, or perhaps you prefer to go with the **Oracle's Redwood** frontend and an **Springboot Webflux** 
backend, or perhaps you want to use a **Vaadin** frontend relying on several micro services using **Quarkus**, **Springboot MVC** 
and **.Net**.

So, the same backend can be used from different frontends like below.

<p align="center"><img src="../../../images/arch-overall-12.svg" width="500"/></p>

We can also use the same fronted to compose UIs defined from different backends.

<p align="center"><img src="../../../images/arch-overall-13.svg" width="500"/></p>

Even from backends served from different urls.

<p align="center"><img src="../../../images/arch-overall-14.svg" width="500"/></p>

The good point about being so simple and decoupled is that you can even easily build your own frontend and backend 
artifacts in order to, e.g., use your own design system while leveraging the existing Mateu's backend libraries.

## Artifacts

Mateu is divided in 3 main artifact types: frontends, the API, and server side libraries implementing that api.

And the following diagram explains the diferent artifacts that Mateu provides:

<p align="center"><img src="../../../images/arch-overall-2.svg" width="300"/></p>

The artifacts in green are the ones I'm currently working on.

## The API

The API is a pretty simple one, and is explained with the following sequence diagram:

<p align="center"><img src="../../../images/arch-overall-3.svg" width="500"/></p>

(right click on the image and open it in a new tab for enlarging it)

The api spec is available here: http://demo.mateu.io/webjars/swagger-ui/index.html

Please notice that the urls anatomy is intended for making it easy to route them and protect them at edge side. 

## Backend-driven frontend

In essence **Mateu** implements the [Model-View-ViewModel (**MVVM**) pattern](https://martinfowler.com/eaaDev/PresentationModel.html). 
It's just that you provide the ViewModel objects on the server, using plain java (or c#, python, ...) classes.

<p align="center"><img src="../../../images/arch-overall-10.svg" width="500"/></p>

So, the frontend is backed by an ephemeral java object in the server side and **Mateu** provides all the necessary 
plumbing, like illustrated in the following diagram:

<p align="center"><img src="../../../images/arch-overall-4.svg" width="500"/></p>

On the other hand, java objects on the server side, when pushed to the frontend, become html elements (e.g. web components) 
inside the browser like in the diagram below:

<p align="center"><img src="../../../images/arch-overall-7.svg" width="600"/></p>

## What happens in the server side

Mateu basically generates controllers for your server side classes annotated with **@MateuUI**, which mainly provide 3 things:

- Serve the static content (index.html and mateu.js) for instantiating the renderer web component in the browser.
- Implement the API the frontend consumes, connecting it to your server-side objects which define your UI.
- Provide a list of defined routes, for any user interface, to facilitate the creation of micro frontends. 

## What happens in the client side

This part highly depends on the implementation but, for the vaadin/lit element one, these are the main guidelines.

### Components

The UI is created using some base components, which mainly have an id, metadata, data and actions properties as shown in the following diagram:

<p align="center"><img src="../../../images/arch-client-1.svg" width="500"/></p>

Components can have children, and the communication between components is done the usual way (prop drilling and event bubbling), as shown below:

<p align="center"><img src="../../../images/arch-client-2.svg" width="500"/></p>

The provided Mateu frontend libraries do an extensive use of events, indeed, which allows to decouple the components on the browser.

### Flux pattern

As per today, I'm using a rx stream for async UI updates, as shown below:

<p align="center"><img src="../../../images/arch-client-3.svg" width="500"/></p>

### Bring your own design system

For using your own design system, you could just provide a different implementation of the mateu-component web component 
and tell the UI to load the javascript, instead of the default one. 

You can use any of the provided frontends as a starting point for building yours. 

## Hexagonal everywhere

I have used hexagonal architecture both in the backend and in the frontend. This strategy has definitely brought 
scalability to the project and has made it easy to support many backend frameworks (Spring MVC, String Webflux, 
Micronaut, Quarkus, Helidon) and several frontends relying on different design systems (Red Hat, SAPUI5, Oracle Redwood, Vaadin).

If tomorrow I need to add something (e.g. a new design system) I know I will easily do it, maximizing code reuse. 

## Extension points

As time passed I realised that, if I wanted Mateu to be really useful to people, I needed to provide extension points so 
anyone can easily introduce support for their particularities. You know, open for extension but closed for modification :)

You can extend the backend by providing your own beans for changing the behaviour in the backend, or by using aspects
(AOP) or http filters (you know, in the end it's just a rest service). You could even use your own annotation processors
or templates to generate a different code, for the controllers.

You can extend the frontend by providing your own web components.

## Distributed first

**Mateu** is architected thinking in complex distributed UIs, so micro frontends and micro services are first class citizens in 
**Mateu**.

Also, **Mateu** is intended to be polyglot, so you can have different micro services written in different languages 
(e.g. Java, Kotlin, C#, Python, ...), or using different frameworks and models (e.g. Springboot MVC, Springboot Webflux, 
Micronaut, Quarkus, ...), and all of them contributing to the same UI. 


