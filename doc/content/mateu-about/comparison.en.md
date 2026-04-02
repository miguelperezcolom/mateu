---
title: "Mateu vs traditional stack"
weight: 7
---

# Mateu vs traditional stack

## Traditional stack

A typical business application is split into:

- backend logic
- frontend app
- API layer
- duplicated validation
- duplicated routing
- duplicated models

That usually means more coordination, more bugs, and more glue code.

## Mateu

Mateu keeps the application model in one place.

You define:

- state
- actions
- navigation
- validation
- layout
- interaction behavior

And Mateu turns that into a working UI.

## Summary

| Traditional stack | Mateu |
|---|---|
| Backend + frontend + API | One application model |
| Duplicated models | Single source of truth |
| Frontend validation + backend validation | Validation defined once |
| Separate menu / route configuration | Navigation derived from code |
| Frontend integration layer | Direct rendering from the model |

## What this changes

Mateu is not just a faster way to build forms.

It is a different way to structure application development.
