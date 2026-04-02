---
title: "Navigation and menus"
weight: 12
---

# Navigation and menus

Mateu builds navigation declaratively using `@Menu`.

Instead of configuring menus or routes manually, navigation is derived from your object structure.

## Basic idea

- each `@Menu` field becomes a menu entry
- if the field type contains more `@Menu` fields, it becomes a submenu
- this process is recursive

## Example

```java
@UI("/_control-plane")
@Title("Control plane")
public class ControlPlaneHome {

    @Menu
    ControlPlaneMenu controlPlane;
}
```

```java
public class ControlPlaneMenu {

    @Menu MasterDataMenu masterData;
    @Menu SitesMenu sites;
    @Menu ReleaseCrudOrchestrator releases;
}
```

```java
public class MasterDataMenu {

    @Menu EnvironmentCrudOrchestrator environments;
    @Menu LanguageCrudOrchestrator languages;
    @Menu CountryCrudOrchestrator countries;
}
```

## What this produces

A hierarchical navigation tree:

- Control plane
  - Master data
    - Environments
    - Languages
    - Countries
  - Sites
  - Releases

## Mental model

Navigation is just your object graph.

- classes define structure
- `@Menu` defines navigation nodes

## Why this matters

In traditional apps, navigation is defined separately:

- routing configuration
- menu configuration
- frontend logic

With Mateu:

- navigation is part of your backend model
- no duplication
- no extra configuration

## Works with microservices

Each service can expose its own menu tree.

The shell can compose them using `RemoteMenu`.

This allows:

- independent UI ownership per service
- unified navigation in the shell
