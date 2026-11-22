---
title: "See it in action"
---

The fastest way to understand Mateu is to try the live demos.

## Live demos

- **[Mateu Explorer](https://explorer.mateu.io)** — every component and UX pattern, live, with the code that declares it.
- **Museums**, the same app on the two web renderers: [Vaadin](https://museums.ec1.mateu.io) and [Oracle Redwood](https://museums-rw.ec1.mateu.io).
- **[Native on Cloud Run](https://mateu-native-demo.netlify.app)** — a Quarkus native backend on Cloud Run with its data in Firestore, and the Redwood front as a static site ([video](https://youtu.be/c7i1Lsq1KFo)).

:::note
The SAP UI5 and Redwood-OJ demos were removed along with those renderers (see the
[parity matrix](/reference/parity/)).
:::

## What to look for

As you explore the demos, pay attention to:

- how much UI is generated from backend definitions
- how interactions are handled without a traditional frontend app
- how the same core ideas can be rendered with different frontend implementations

## Why the demo matters

The demos also reflect one of Mateu's architectural strengths: stateless interaction and decoupled rendering.

The frontend can remain static, while the backend handles UI state and behavior through Mateu's model.
