# The app shell (`type: AppShell`)

The chrome around every screen of a mount — title, menu, header extras — as a definition bound to
the mount root:

```yaml
# specs/ui/routes.yaml
routes:
  - route: ""
    layout: app.yaml
```

```yaml
# specs/ui/app.yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: AppShell
title: Back office
subtitle: Operations
variant: MENU_ON_TOP          # AUTO | MENU_ON_TOP | HAMBURGER_MENU | HAMBURGER_SECTIONS | MENU_ON_LEFT | RAIL | TABS | TILES
homeRoute: dashboard          # optional; else the mount's home:, else the first navigable menu item
themeToggle: true
menu:
  - {type: RouteLink, label: Dashboard, route: dashboard, icon: "vaadin:dashboard"}
  - type: Menu                # a group
    label: Sales
    submenu:
      - {type: RouteLink, label: Orders, route: orders}
      - type: RuleLink        # a leaf that RUNS a flow instead of navigating
        label: New order
        rules:
          - {action: RunAction, actionId: newOrder}
  - {type: RouteLink, label: Users, route: admin/users, access: {roles: [admin]}}
actions:                      # the shell's flows (a RuleLink above runs one by id)
  - id: newOrder
    steps:
      - {type: MarkClean}
      - {type: Navigate, route: orders/new}
widgets:                      # components in the header
  - {type: Text, text: v1.0}
```

- Menu entries: `RouteLink` (`label`, `route` mount-relative, `icon`, `description`, `access`),
  `Menu` (`label`, `submenu`; `presentation: {display: cards}` opens as a panel of cards),
  `RuleLink` (runs a shell flow or an `actions.yaml` entry in the browser), `RemoteMenu`
  (`baseUrl`, `route`, `explode` — pulls the menu of another Mateu app, federation).
- A menu entry pointing at a route with `access:` inherits it (hidden for others).
- Other keys: `pageTitle`, `logo`, `favicon`, `accentColor`, `layout` (`SINGLE_SLOT|SPLIT`),
  `drawerClosed`, `backLink: PARENT`, `commandCenter`, `chromeless`, `accessKeys`, `shortcuts`
  (`[{key, route|actionId, label, code}]`), `headerValues` (`[{id, label, value}]`),
  `contextSelectors` (`[{fieldName, label, options | optionsSource}]` — app-context pickers sent
  with every request), `headerActions` (`[{label, icon, route | actionId, children}]`),
  `notifications` (`{source: {ref: inbox}, markRead: {ref: inbox-read}}`), `globalSearch`
  (`{source: {ref: search}}`, called with `${state.searchText}`), idle-session keys
  (`idleTimeoutMinutes`, `idleWarningSeconds`, `idleSignOutUrl`), `liveUpdates`.
- **Never leave a mount without a home** (`home:` on the mount, `homeRoute:` here, or a navigable
  first menu item): the shell would load its own root route, which is the shell again.
- Works on the Java server and in a static bundle (the browser expands it). **The .NET and Python
  servers have no `type: AppShell`**: there the shell is the app class (`[App]` + `[MenuItem]` in
  C#, `@app` + `@menu_item` in Python) and YAML provides the pages.
- Not authorable here yet (need an `@App` Java class): SSE/MCP/upload URLs of the AI chat and
  app-level FABs.
