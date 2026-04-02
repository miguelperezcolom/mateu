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

They can be defined as:

- methods annotated with `@Toolbar`
- methods annotated with `@Button`
- `Runnable` fields annotated with `@Button`

## Buttons and placement

- `@Toolbar` → top toolbar  
- `@Button` on methods → bottom form actions  
- `@Button` on fields → inline buttons  

## Action behavior

Actions can be configured declaratively using `@Action`.

## Validation

Bean validation is automatically enforced in the UI.

## Reactions

Triggers define when actions run.

## Dynamic behavior

Rules define how the UI changes dynamically in the browser.

## UI effects

Actions can return:

- `Message` → user feedback  
- `UICommand` → browser control  

## Mental model

- state → fields  
- actions → methods or buttons  
- action behavior → `@Action`  
- reactions → triggers  
- rules → dynamic behavior  
- validation → bean validation  
- effects → UI feedback  
