---
title: "Interaction model in Mateu"
weight: 7
---

# Interaction model in Mateu

Mateu does not treat interaction as separate frontend code.

Interaction is part of the application model.

At a high level, the interaction model is built from:

- actions
- action behavior
- triggers
- rules
- UI effects

---

## Security and interaction

Security can also affect visibility and interaction in the UI.

For example, elements can be shown or hidden depending on roles or scopes.

This means interaction is not only driven by actions and rules, but also by declarative security constraints.

---

## Summary

Mateu interaction is not split across:

- backend logic
- frontend event handlers
- browser-side glue code

Instead, it is part of one declarative model.
