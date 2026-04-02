---
title: "Mateu vs traditional stack"
weight: 5
---

# Mateu vs traditional stack

## The traditional approach

A typical business application built with a standard stack looks like this:

- **Spring Boot** handles domain logic and persistence
- **REST API** exposes endpoints to the frontend
- **React / Angular / Vue** implements the UI
- **Validation** is duplicated: once in the backend, once in the frontend
- **Models** are duplicated: domain objects on one side, DTOs and view models on the other
- **Routing** is defined twice: Spring routes and frontend routes

Every screen requires work in at least two places. Every change needs coordination across both. Every model change risks inconsistency.

## The Mateu approach

With Mateu, the application model lives in one place.

You define state, actions, navigation, validation, and layout in Java. Mateu turns that definition into a working UI.

| Traditional stack | Mateu |
|---|---|
| Backend + frontend + API | One application model |
| Duplicated models | Single source of truth |
| Validation defined twice | Validation defined once (Bean Validation) |
| Separate route configuration | Navigation derived from `@Menu` and `@Route` |
| Frontend integration layer | Rendered directly from the model |
| Frontend team required | Backend developers own the full stack |

## What this changes

This is not just a faster way to build forms.

It is a different way to structure development: fewer files, fewer handoffs, fewer places where things can get out of sync.

For internal tools, back-offices, and enterprise portals, that difference compounds quickly across a team and across time.

## What it does not change

Mateu does not help with highly custom consumer-facing UIs, complex animations, or interaction patterns that require bespoke frontend work.

For those cases, a purpose-built frontend is the right tool. Mateu is optimized for a different, very common class of applications.
