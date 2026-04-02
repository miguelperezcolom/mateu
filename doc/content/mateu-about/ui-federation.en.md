---
title: "UI federation"
weight: 22
---

# UI federation

Mateu lets multiple services contribute to a single UI.

Each service can expose:

- its own UI root
- its own menu tree
- its own CRUDs and screens

A shell application can compose those modules using `RemoteMenu`.

## What this gives you

- decentralized ownership
- centralized navigation
- no frontend integration layer
- microfrontends without a traditional frontend application

## What the shell can own

The shell can also centralize concerns such as:

- branding
- authentication
- page metadata
- shared widgets

This makes it possible to compose a distributed UI while still keeping a consistent application shell.
