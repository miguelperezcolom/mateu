---
title: "Mateu vs visual builders"
description: "How Mateu differs from low-code and internal-tool platforms — by where the model lives, who decides at runtime, and what happens when you outgrow the tool."
---

Mateu now has a component catalog with a published schema, screens authored as YAML and a visual
editor. That puts it in the same conversation as Oracle Visual Builder, OutSystems, Mendix, Retool,
Appsmith and Budibase — so it is worth being precise about where the overlap actually is.

The overlap is the **authoring surface**. The difference is everything around it: where the model
lives, who decides what happens at runtime, and what it costs you to leave.

This is deliberately not a feature matrix. Feature lists change every quarter; the differences below
are structural.

## Where the model lives

A visual builder keeps your application in its own store — a project in its cloud, a proprietary
file, a database only the platform reads. The tool is the way in and usually the only way in.

A Mateu model is **files in your repository**: `.java` classes and `.yaml` definitions, next to the
code they drive. They go through your pull requests, your code review, your branches, your CI, your
release. The visual editor is one way to write those files; a text editor is another; both produce
the same lines in the same commit.

That single difference is what the rest of this page is downstream of.

## Who decides at runtime

| | Visual builders | Mateu |
|---|---|---|
| Data access | connectors and bindings configured in the tool | your repositories, your use cases, your transactions |
| Business rules | expressions and flows in the platform's runtime | your domain code, in your language |
| Auth | the platform's model, mapped to yours | your framework's security, already in the request |
| Where integration happens | the browser, per page | the server: one endpoint, one protocol |

Mateu's runtime spine is a wire protocol between your backend and a renderer. The screen is derived
from your model, but *what happens when the user presses the button* is a method you wrote, in the
application you already had.

## When you outgrow it

Every model-driven tool meets the same wall: one screen in forty needs to be something the templates
do not cover. What matters is not whether it can be done, but **what you keep when you drop down** —
if the answer is "rewrite it outside the tool", the savings on the other thirty-nine stop counting.

In Mateu that screen builds its own component tree by hand and keeps its state, its actions, its
validation, its routing and the surrounding app chrome. Those guarantees are pinned by a test on
purpose, because a promise nothing checks erodes quietly.

## Leaving

- The model is already in your repo — there is nothing to export.
- `mateu:bundle` renders the declared screens into a static bundle a CDN serves.
- `mateu:openapi` exports the same declarations as an OpenAPI document.
- The wire protocol is documented and the renderer contract is public, so a renderer you write
  yourself is a supported path, not a hack.

## Backend language

Visual builders are largely indifferent to what your backend is written in — you integrate with it
over HTTP like any other client. Mateu goes the other way: the UI is defined **in** the backend, in
Java, Kotlin, C# or Python, sharing its model and its validation. If you have no backend to speak
of, that is not an advantage; if you have one and it owns the business rules, it removes an entire
translation layer.

## What visual builders do better

Plainly, because it matters when choosing:

- **Non-developers can build screens.** Mateu's authoring surface is friendlier than it was, but its
  audience is still a team with a repository and a build.
- **Batteries included** — hosting, user management, connectors to hundreds of SaaS products,
  environments and audit trails, all in the box.
- **Free-form visual layout.** A WYSIWYG canvas positions anything anywhere. Mateu derives layout
  from the model and lets you adjust it; it is not a design tool.
- **Governance for a large citizen-developer population** is a product feature there, and not
  something Mateu attempts.

## Choosing

| Pick a visual builder when | Pick Mateu when |
|---|---|
| the builders are not developers | the builders own a backend |
| the app is mostly connectors over SaaS data | the logic lives in your domain code |
| you want hosting and governance in the box | you want the UI in the same repo, review and release as the code |
| the screens are bespoke by design | the screens are forms, listings and workflows over your model |

## A note on Oracle Visual Builder

VB is also a **target**, not only a competitor: one of Mateu's renderers is a Visual Builder
application, so a Mateu backend can be served through the Redwood/VB runtime and its design system.
See [Oracle Redwood](/design-systems/oracle-redwood/).

## Next

- [The model](/mateu-about/the-model/) — what is actually being authored, and the rules that keep it honest
- [Mateu vs the traditional stack](/mateu-about/comparison/) — the comparison with a hand-written SPA
- [When to use Mateu](/when-to-use-mateu/)
