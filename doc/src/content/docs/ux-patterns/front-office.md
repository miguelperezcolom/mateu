---
title: Front-office screens
description: Composing the front-office components into one dense operational screen — queue, context, wizard, folio, monitor.
---

**Status:** Composition — no new primitive needed

## Intent

A front-office screen — a hotel reception, a bank branch counter, a service desk — is where an operator works a **queue** of people through **tasks** with money involved. It needs everything at once: who is next, who am I serving, what step am I on, what do I sell, what do I charge, and are the automations behind it healthy.

Mateu covers this with a family of high-level components that compose into one dense screen; each is documented on its own page.

## The pieces

| Concern | Component |
|---|---|
| Work queue rail (arrivals / departures / in-house) | [Task queue](./task-queue) |
| Context banner of the current guest | [Entity header](./entity-header) |
| Check-in steps | [Wizard](./wizard) |
| Room assignment | [Resource grid](./resource-grid) |
| Upgrade offer | [Offer card](./offer-card) |
| Priced extras | [Add-on picker](./addon-picker) |
| Side-effects checklist / incidents | [Status list](./status-list) |
| Pax registered N of M | [Task progress](./task-progress) |
| Folio breakdown at check-out | [Ledger](./ledger) |
| Method + charge | [Payment picker](./payment-picker) |
| Balance vs preauthorization | [Meter](./meter) |
| Stay-history KPIs | [Stat](./stat) |
| Automations health | [Process monitor](./process-monitor) |

## Structure

```
┌────────────┬─────────────────────────────────────────────┬──────────────┐
│ TaskQueue  │ EntityHeader — María Fernández · PLATINUM   │ StatusList   │
│ Llegadas   ├─────────────────────────────────────────────┤ 🌡 A/C ruido │
│ ▸ 1108 ●   │ Wizard: Datos → Habitación → Extras → Firma │ 🔑 Grabar    │
│ ▸ 1204     │   TaskProgress  pax 1/4  [Añadir pax →]     │ ✓ SES auto   │
│ Salidas    │   ResourceGrid  1201 1204★ 1206 1208        ├──────────────┤
│ ▸ 901      │   OfferCard  Master Suite  + € 65/noche     │ Meter        │
│            │   AddOnPicker  🍹 🅿 🕕   Añadidos: € 383    │ ████░ 69%    │
│            ├─────────────────────────────────────────────┤ Stat · Stat  │
│            │ Ledger  € 1.710,50 · PaymentPicker [Cobrar] │              │
├────────────┴─────────────────────────────────────────────┴──────────────┤
│ ProcessMonitor  ● Facturación a Crédito ⚠ 6 [Solucionar] · ● Comercial. │
└──────────────────────────────────────────────────────────────────────────┘
```

Arrange the panels with the usual layout primitives — `@Zones` for the columns, `@Compact` for density, `@Section(sticky=true)` to pin the queue or the header — exactly like a [Workspace](./workspace). The queue's `actionId` loads the selected guest into the central panels ([component communication](./component-communication) handles the refresh); the wizard's completion action confirms the check-in.

## Runnable reference app

The whole pattern is implemented end to end in `demo/demo-front-office` (Spring Boot MVC, `mvn spring-boot:run`, port 8594): a Check-In work queue feeding a 4-step wizard with a persistent `EntityHeader`, Check-Out with `Ledger` + `PaymentPicker`, an En Casa guest 360 with `Meter`s and a `Stat` history row, and an Automatizaciones board with `Scoreboard` + `ProcessMonitor` — plus a **Modo Staff/Cliente** header selector ([`@AppContext`](./app-context)) that re-projects every screen via [`@Audience`](./audience-projection).

## Principles served

- **Preserve context** — the guest banner and the queue never leave the screen
- **Minimize navigation** — check-in, upsell and check-out happen without a page jump
- **Workflow over screens** — every panel exists for a step of the operator's job
