---
title: "Apps and pages"
weight: 3
---

# Apps and pages

Mateu distinguishes between two high-level UI shapes:

- **App**
- **Page**

This distinction matters because it defines how navigation and screen chrome are organized.

## App

An app is the right fit when you want a top-level shell with navigation and shared UI elements.

Typical app-level concerns include:

- menu tree
- widgets
- page metadata
- drawer state
- branding

In practice, an app can expose things like:

- `@Menu`
- `@Widget`
- `@PageTitle`
- `@Title`
- `@Subtitle`
- `@FavIcon`
- `@Style`
- `@CssClasses`
- `@DrawerClosed`

## Page

A page is the right fit when you want a single screen with content sections and actions.

Typical page-level concerns include:

- toolbar actions
- page buttons
- header content
- footer content
- avatar
- page metadata

In practice, a page can expose things like:

- `@Button`
- `@Toolbar`
- `@Header`
- `@Footer`
- `@Avatar`
- `@PageTitle`
- `@Title`
- `@Subtitle`
- `@FavIcon`
- `@Style`
- `@CssClasses`

## Mental model

- use an **App** when you need shell-level navigation and shared widgets
- use a **Page** when you need a single structured screen

## Why this matters

This lets Mateu express both:

- full application shells
- individual pages and screens

without introducing a separate frontend composition layer.
