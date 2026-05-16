---
title: "Declarative vs fluent"
weight: 4
aliases:
  - /java-user-manual/declarative-vs-fluent/
---

# Declarative vs fluent

Mateu supports two main ways of building UIs in Java.

## Declarative

In the declarative style, you describe the UI with:

- classes
- fields
- methods
- annotations

### Best for

- forms
- CRUD screens
- fast development
- simple UIs

## Fluent

In the fluent style, you build the UI with Mateu's Java API.

### Best for

- custom layouts
- advanced composition
- fine-grained control

## Recommendation

Start with the declarative style.

Use the fluent style when you need more control.

```mermaid
flowchart LR
    subgraph Declarative
        A[Java class\nfields · methods\nannotations] --> B[Mateu infers layout\nand behaviour]
        B --> C[Form · CRUD · grid]
    end
    subgraph Fluent
        D[Builder API\nForm · Grid\nLayouts · Charts] --> E[Explicit component tree]
        E --> F[Custom layouts\nadvanced composition]
    end
    C -->|can embed| F
    F -->|can include| C
```
