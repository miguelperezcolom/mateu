---
title: How Mateu works
---

# How Mateu works

Mateu turns backend code into real user interfaces.

## 1. You define your UI in Java

You use plain Java classes and annotations:

- fields → state
- methods → actions
- annotations → UI behavior

## 2. Mateu exposes it through a simple API

Your UI is served as a backend-driven model accessible through a simple API.

No manual API design required.

## 3. A renderer builds the UI

A frontend renderer turns that model into a real UI in the browser.

- forms
- tables
- layouts
- navigation

## 4. Everything is stateless

Each interaction is a request.

No session state. No UI state syncing.

Perfect for:

- microservices
- serverless
- distributed systems

## 5. Frontend and backend are decoupled

You can:

- swap frontends
- plug your own design system
- embed UIs anywhere

---

## One idea

Mateu turns backend objects into UI using a simple API and a pluggable renderer.
