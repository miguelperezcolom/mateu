---
title: "Static content"
weight: 11
---

You create and run your Mateu UI on top of a Springboot/Micronaut/Quarkus/Helidon application, and all those frameworks 
provide mechanisms for serving static content.

You only need to follow their specific instructions. E.g. for springboot and micronaut you'll place them under the **static** folder
inside **resources**.

Please notice that serving that static content from your java code is something you only want to do in some simple use cases,
where you are serving both static content and api from your micro service, e.g. by adding one of the frontend dependencies to your project. 
Usually you will prefer to serve the static content from a CDN and only the apis from your micro services. 
You have an example of that on the demos of Mateu, where all the static content is served from Netlify and the backend 
is only serving the api. See https://mateu.io/mateu-about/see-it-in-action/ 


