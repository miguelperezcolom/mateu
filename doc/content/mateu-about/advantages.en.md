---
title: "Advantages"
weight: 2
---

These are the reasons why I would use Mateu instead of other approaches. This is just my personal opinion but, please, let me know if you think I'm not right.

## Versus traditional frontend development

You know, you have frontend developers who build nice frontends using any modern frontend framework, consuming an API which has been agreed with the backend developers who, in the end, implement that api and the business logic on the server side.

While I would myself stick to this approach for small projects or B2C websites with a lot of graphic design load, my experience is that this approach does not scale well and introduces a lot of accidental complexity to the typical enterprise projects (an intranet/extranet, a portal for professionals, ...) to which Mateu is targeted.

With Mateu you simply remove the frontend development from the equation and the backend team owns the features e2e. No overhead for defining and agreeing API specs, no need for syncing deployments, ... you simply have a better live. 

## Versus Vaadin

**Vaadin** is a wonderful framework, built by awesome people, and in some ways it shares similarities with **Mateu**. However, in my opinion, Mateu is better suited for today’s complex distributed architectures.

In Mateu, **microfrontends are first-class citizens**, and its **stateless server-side design** makes it especially well-adapted to modern **microservices** and **serverless deployments**. This stateless approach not only simplifies development but also streamlines configuration and deployment.

Mateu also provides **higher-level components**, making it easier to define and maintain enterprise applications. In practice, this often means writing significantly less code compared to other frameworks.

Another key advantage is Mateu’s **fully decoupled architecture**: the backend and frontend communicate only through a very simple API. This makes it ideal for organizations that want to customize either side—for example, by adopting their own design system or preferred frontend framework—while still leveraging the rest of Mateu.

Finally, Mateu is designed with **multi-language support in mind**. While Java/Kotlin are supported today, the roadmap includes C#, Python, and potentially other server-side languages in the future.

Of course, these are just my personal views based on my experience. I’d love to hear your thoughts if you see things differently 🙂  


