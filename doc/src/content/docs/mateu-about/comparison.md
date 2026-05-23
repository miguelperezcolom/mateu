---
title: "Mateu vs traditional stack"
---

The difference between Mateu and a traditional stack is not a matter of tooling — it is a matter of where the UI definition lives and how many times you have to say the same thing.

## A concrete scenario

Imagine adding a `discount` field to an order management screen.

**Traditional stack:**

1. Add `discount` to the domain model
2. Add `discount` to the API response DTO
3. Add `discount` to the OpenAPI spec
4. Add `discount` to the TypeScript interface
5. Add the field to the React form component
6. Add validation to the frontend form
7. Handle the updated API response in the frontend state

Seven steps. Multiple files across two codebases.

**Mateu:**

1. Add `discount` to `OrderEditor` with `@DecimalMin("0")`

One step. One file.

## Side-by-side comparison

| Concern | Traditional stack | Mateu |
|---|---|---|
| UI definition | frontend components (JSX / templates) | Java ViewModel class |
| Validation | frontend library (Zod, Yup, etc.) + backend | Bean Validation, once |
| Routing | frontend router (React Router, etc.) | `@UI` + `@Route` annotations |
| Navigation | frontend nav config | `@Menu` annotations |
| Relationships | frontend API call + state | `@Lookup` + backend supplier |
| Browser feedback | frontend toast / notification library | return `Message` from action |
| Model | backend model + API DTO + frontend type | one Java class |
| Deployment | backend + frontend build + CDN | one Java application |
| Scaling | stateful sessions or session replication (in some cases) | stateless, no affinity |
| Design system | bundled into frontend | pluggable renderer |

## What the traditional stack is still better at

Consumer-facing products with complex animations, highly custom interactions, and brand-specific visual design benefit from a dedicated frontend application. Frontend frameworks give experienced teams precise control over the user experience.

Mateu does not try to compete with this. The target is the class of applications where the frontend split is cost without commensurate benefit.

## When to choose Mateu

Choose Mateu when:

- the audience is internal (employees, operators, admins)
- the UI is primarily data-driven (lists, forms, filters, actions)
- the team is backend-heavy and frontend expertise is limited or expensive
- maintaining a separate frontend application is a burden rather than an asset
- you need to ship fast and keep maintenance cost low

## When not to choose Mateu

Do not choose Mateu when:

- the product is consumer-facing and visual differentiation is important
- the UI requires complex client-side state that goes beyond forms and lists
- you need fine-grained control over animations, gestures, or real-time interactions
- the team has strong frontend expertise and wants to use it

## The core tradeoff

Mateu gives you speed and simplicity at the cost of frontend flexibility. For the right applications, that is an excellent trade.

## Related

- [Philosophy](/mateu-about/philosophy) — why accidental complexity is the problem
- [Advantages](/mateu-about/advantages) — what you concretely gain
- [Use cases](/use-cases) — types of applications where Mateu fits
