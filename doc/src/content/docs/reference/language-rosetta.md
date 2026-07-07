---
title: Language Rosetta
description: The same Mateu declaration in Java, C# and Python — side by side.
---

Every Mateu server emits the **same wire model**, so the concepts are identical across languages —
only the declaration syntax changes. This page maps the idioms; the concept documentation (UX
patterns, execution model, wire contract) applies to all three.

## Declaring views and apps

| Concept | Java | C# (.NET) | Python |
|---|---|---|---|
| Routed view | `@UI("/route")` | `[UI("route")]` | `@ui("route")` |
| Title | `@Title("...")` | `[Title("...")]` | `@title("...")` |
| App shell | `@UI` class with `@Menu` fields | `[App("...")]` class with `[MenuItem]` methods | `@app("...")` class with `@menu_item` methods |
| CRUD | `extends AutoCrud<T>` + `repository()` | `class X : Crud<T>` + `Fetch(...)` | `class X(Crud[Thing])` + `fetch(...)` |
| Wizard | `extends Wizard` + step fields | `Wizard` + `[Step]` | `Wizard` + `Step()` |

## Fields

| Concept | Java | C# | Python |
|---|---|---|---|
| Required | `@NotNull` / `@NotEmpty` | `[Required]` | `Annotated[str, Required()]` |
| Label | `@Label("...")` | `[Label("...")]` | `Annotated[str, Label("...")]` |
| Section | `@Section("...")` | `[Section("...")]` | `Annotated[str, Section("...")]` |
| Explicit stereotype | `@Stereotype(...)` | `[Stereotype("...")]` | `Annotated[str, Stereotype("...")]` |
| Multiline | `@Multiline` | `[Multiline]` | `Annotated[str, Multiline()]` |
| Password | stereotype `password` | `[Password]` | `Annotated[str, Password()]` |
| Money | `@Stereotype(money)` | `[Money]` | `Annotated[str, Money()]` |
| Plain text (read-only) | `@PlainText` | `[PlainText]` | `Annotated[str, PlainText()]` |
| Radio group | `@UseRadioButtons` | `[UseRadioButtons]` | `Annotated[MyEnum, UseRadioButtons()]` |
| Nav link | `@LinkTo("/x/${state.id}")` / `LinkSupplier` | `[LinkTo("...")]` / `ILinkSupplier` | `Annotated[str, LinkTo("...")]` / `link(member_name)` |
| Signature capture | `@Signature` | `[Signature]` | `Annotated[str, Signature()]` |
| Photo capture | `@PhotoCapture` | `[PhotoCapture]` | `Annotated[str, PhotoCapture()]` |
| Tree select | `@TreeSelect(leavesOnly=…)` | `[TreeSelect(leavesOnly: …)]` | `Annotated[str, TreeSelect(leaves_only=…)]` |
| Static options | class implements `OptionsSupplier` | class implements `IOptionsSupplier` | the view's `options(field_name)` method |

## Actions & page features

| Concept | Java | C# | Python |
|---|---|---|---|
| Button | `@Button` method | `[Button]` method | `@button()` method |
| Toast message | return `Message` | return `Message` | return `Message` |
| KPI | `@KPI` field | `[Kpi("Open tickets")]` method | `@kpi("Open tickets")` method |
| FAB | `@Fab(icon=…)` method | `[Fab("icon")]` method | `@fab("icon")` method |
| Keyboard shortcut | `@Action(shortcut="ctrl+s")` | `[Shortcut("ctrl+s")]` | `@shortcut("ctrl+s")` |
| Compact mode | `@Compact` | `[Compact]` | `@compact` |
| Adaptive layout | (default heuristics) | `[AutoLayout]` | `@auto_layout` |
| Banner | `@Banner(theme=…)` method | `[Banner(BannerTheme.Info, "…")]` method | `@banner(BannerTheme.INFO, "…")` method |
| Header badge | `@BadgeInHeader` field | `[HeaderBadge("success")]` | `Annotated[..., HeaderBadge(color="success")]` |
| App context selector | `@AppContext` field | `[AppContext]` member | `@app_context` method |
| Emit event | `UICommand.dispatchEvent` / `@Emits(name=…)` | `[Emits("order-created")]` | `@emits("order-created")` |
| Subscribe to event | `@SubscribeTo(event=…, action=…)` | `[SubscribeTo("event", "action")]` | `@subscribe_to("event", "action")` |
| Unsaved-changes guard | `@ConfirmOnNavigationIfDirty` | `[ConfirmOnNavigationIfDirty]` | `@confirm_on_navigation_if_dirty` |
| i18n | `Translator` | `ITranslator` | `Translator` |

Exact signatures can drift — the per-language manuals ([C#](/csharp-user-manual/),
[Python](/python-user-manual/)) and each backend's golden tests
(`backend/dotnet/test`, `backend/python/tests`) are the source of truth.

## What stays identical

- The **wire**: `POST /{baseUrl}/mateu/v3/sync/{route}` → `UIIncrement` JSON.
- The **renderers**: web (Vaadin, Redwood, SAP UI5, PatternFly) and native (JavaFX, Compose,
  React Native) render any server without client changes.
- The **concepts**: everything under [UX Patterns](/ux-patterns/) and the execution model.

For what each server supports today, see the [feature parity matrix](/reference/parity/).
