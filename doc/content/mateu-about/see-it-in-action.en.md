---
title: "See it in action"
weight: 3
---

To see Mateu in action just go to:

- https://vaadin.mateu.io/fluent/fluent-app/use-cases/rra for a **VAADIN** component/feature explorer
- https://sapui5.mateu.io/fluent/fluent-app/use-cases/rra for a **SAPUI5** component/feature explorer
- https://redwood.mateu.io/fluent/fluent-app/use-cases/rra for a **REDWOOD** component/feature explorer
- https://redwood-oj.mateu.io/fluent/fluent-app/use-cases/rra for a **REDWOOD** component/feature explorer using the **JET** components

Please notice that the demo app backend has been deployed to 2 pods inside a Kubernetes cluster running on infrastructure 
provided by Hetzner and managed using Cloudfleet. This means that every request you do is load balanced between those 2 
pods and that showcases the stateless nature of any UI built with Mateu :) 

All the demos frontends are deployed as static sites in Netlify, calling the same backend.

<p align="center"><img src="../../../images/demo-1.svg" width="900"/></p>

> Note: Even though I first relied on Cloudflare for the ssl support and as CDN, I finally removed it due to random 
> failures. Now I use a nginx running on a pod inside the cluster, with certbot automatically renewed let's encrypt 
> certificates, and no issue so far. 
