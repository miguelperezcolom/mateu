---
title: "See it in action"
weight: 3
---

To see Mateu in action just go to:

- https://demo.mateu.io/fluent/fluent-app/use-cases/rra for a component/feature explorer
- https://article2.mateu.io for a micro frontends example
- https://vaadin.mateu.io/fluent/fluent-app/use-cases/rra for a **VAADIN** component/feature explorer
- https://sapui5.mateu.io/fluent/fluent-app/use-cases/rra for a **SAPUI5** component/feature explorer
- https://redwood.mateu.io/fluent/fluent-app/use-cases/rra for a **REDWOOD** component/feature explorer


Please notice that the demo app has been deployed to 2 pods inside a Kubernetes cluster running on infrastructure 
provided by Hetzner and managed using Cloudfleet, and all that behind Cloudflare. 
This means that every request you do is load balanced between those 2 pods and that showcases the stateless nature 
of any UI built with Mateu :) 

Note: I finally removed Cloudflare due to random failures. Now I use a nginx running on a pod inside the cluster, 
with certbot automatically renewed let's encrypt certificates, and no issue so far. 
