---
title: "Fluent records"
weight: 5
---

# Fluent records

These Java records form the core of Mateu's fluent API. They are built with Lombok `@Builder` and compose directly into component trees.

## Application shell

| Record | Description |
|---|---|
| [`App`](app/) | Full application shell with navigation, header, and layout variant |
| [`UI`](ui/) | Lightweight UI configuration (favicon, page title, home route) |
| [`Page`](page/) | Page wrapper with title, breadcrumbs, toolbar, badges, and KPIs |

## Content containers

| Record | Description |
|---|---|
| [`Form`](form/) | The standard page content container (title, content, header, footer, toolbar) |
| [`Listing`](listing/) | A grid-based list view with search, filters, columns, and pagination |
| [`MenuBar`](menu-bar/) | A horizontal or vertical navigation bar |

## Actions

| Record | Description |
|---|---|
| [`Action`](action/) | A named action wired to a button or toolbar |
