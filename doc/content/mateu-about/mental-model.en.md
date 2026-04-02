---
title: "The Mateu model"
weight: 5
---

# The Mateu model

Mateu is not just a UI framework.

It is a **spec-driven application model**.

## What you define

- state (fields)
- actions (methods / buttons)
- action behavior (`@Action`)
- relationships (`@ForeignKey`)
- navigation (`@Menu`)
- routing (`@UI`, `@Route`)
- layout (annotations)
- presentation (`@Stereotype`, `@Style`)
- reactions (`@Trigger`)
- dynamic UI (`@Rule`)
- validation (Bean Validation)
- UI effects (`Message`, `UICommand`)

## What Mateu does

Mateu turns that into:

- UI rendering
- navigation structure
- interaction model
- browser behavior
- API communication

## One model

Instead of:

- backend model
- frontend model
- API layer
- duplicated validation
- duplicated routing

You have:

👉 one model

## Mental shift

Mateu is:

- not backend-driven UI
- not frontend-driven UI

It is:

👉 **spec-driven UI**

## One sentence

Define your app once. Mateu builds everything else.
