---
title: "Architecture"
weight: 10
---

# Architecture

Mateu's architecture is intentionally simple.

At a high level, it has three pieces:

1. **A backend UI definition**
2. **A simple API**
3. **A frontend renderer**

<p align="center"><img src="../../../images/arch-overall-1.svg" width="400"/></p>

## 1. UI definition lives in the backend

You define your UI using backend code.

In Java, that usually means classes, annotations, fields, actions, routing, and navigation structure.

## 2. Mateu exposes that UI through a simple API

The frontend does not need a hand-built application-specific API.

Instead, Mateu exposes a small, generic protocol that the renderer can consume.

## 3. A renderer turns it into a real UI

A frontend renderer converts the backend definition into visible components in the browser.

That renderer can produce forms, layouts, tables, actions, menus, pages, and apps.

## Apps and pages

Mateu can represent both:

- application shells with menus and widgets
- individual pages with headers, footers, buttons, and content

This makes it suitable for both full consoles and isolated embedded screens.

## Stateless by design

One of Mateu's most important architectural decisions is that the UI interaction model is stateless.

That makes it a strong fit for:

- microservices
- horizontally scaled deployments
- distributed systems
- serverless-style architectures

## Frontend and backend are decoupled

Because frontend and backend communicate through a simple API, both sides can evolve independently.

That means you can:

- swap frontend implementations
- use different design systems
- embed Mateu UIs in other applications
- compose UIs from multiple backends

## A real microservices pattern

A practical way to use Mateu is to let each microservice own both its domain logic and the UIs related to that domain.

A shell can compose those services into one application surface.

## One sentence summary

Mateu turns backend objects into real UIs through a simple API and a pluggable renderer.
