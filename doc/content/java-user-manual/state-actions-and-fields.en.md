---
title: "State, actions and fields"
weight: 5
---

# State, actions and fields

Mateu UIs are built from a small set of concepts.

## State (fields)

Fields represent UI state.

## Actions

Actions represent behavior triggered by the user.

## Action behavior

Actions can be configured declaratively using `@Action`.

This includes:

- validation  
- confirmation  
- execution mode  
- UI behavior  

## Buttons and actions

Actions can be declared as methods or fields.

## Validation

Bean validation is automatically enforced in the UI.

## Reactions

Triggers define when actions run.

## Dynamic client-side behavior

Rules define how the UI changes dynamically.

## Mental model

- state → fields  
- actions → methods or buttons  
- action behavior → `@Action`  
- relationships → foreign keys  
- presentation → stereotypes  
- reactions → triggers  
- rules → dynamic behavior  
- validation → bean validation  
