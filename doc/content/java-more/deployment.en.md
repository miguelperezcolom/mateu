---
title: "Deployment"
weight: 16
---

Mateu is just a library which is used for building UIs on top of an existing framework (e.g. springboot or micronaut), 
so you just need to follow their instructions. 

Please notice that, in the end, Mateu is just providing some endpoints which are consumed by a frontend.

For deploying the frontend static content, you can either do it from your micro service by adding any of the frontend
dependencies, or you can serve that static content elsewhere (e.g. from a CDN like Netlify). That's up to you.
