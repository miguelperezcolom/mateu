---
title: "Mateu in microservices"
weight: 25
---

# Mateu in microservices

Each service owns:

- its UI root  
- its menu tree  

Navigation is exposed via `@Menu` and composed in the shell.

This results in:

- clear ownership  
- no frontend duplication  
- unified navigation  
