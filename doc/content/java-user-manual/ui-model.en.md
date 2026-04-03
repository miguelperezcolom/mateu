---
title: "UI model in Mateu"
weight: 5
---

# UI model in Mateu

Mateu does not build UIs the traditional way.

You don’t assemble components manually.

Instead, the UI emerges from:

- field types (inference)
- stereotypes (rendering type)
- layout annotations (structure)
- style (fine control)
- UI regions (placement)

---

## UI regions

Mateu can project content into specific UI regions, such as the footer.

This is done declaratively using annotations like `@Footer`.

👉 See layout and composition for details.

---

## Mental model

Mateu UI is:

> inferred → structured → placed → refined

- inference chooses defaults  
- layout organizes structure  
- regions define placement  
- stereotypes adjust rendering  
- style fine-tunes appearance  
