---
title: "Permissions in YAML"
description: "Restrict routes, menu items, actions and components of a YAML-authored app by role, group, scope or permission — enforced on the server."
---

A YAML-only app restricts what each user sees and does with the same rules the annotations
`@EyesOnly`, `@ReadOnlyUnless` and `@DisabledUnless` express in Java. Same four dimensions, same
matching, **same evaluator**: the YAML keys are read by the very `Authorizer` that reads the
annotations. There is one rule, written two ways.

```yaml
# specs/ui/routes.yaml
routes:
  - route: admin/users
    layout: users.yaml
    access: {roles: [admin]}          # anybody else gets 403, here and on every nested route

# specs/ui/app.yaml (type: AppShell)
menu:
  - {type: RouteLink, label: Users, route: admin/users}        # hidden: it inherits the route's access
  - {type: RouteLink, label: Audit, route: audit, access: {roles: [auditor]}}

# specs/ui/users.yaml (a page definition)
actions:
  - id: delete
    access: {roles: [manager]}        # not advertised, buttons naming it disabled, 403 if called
    restAction: {source: {ref: users-delete}}
layout:
  type: VerticalLayout
  content:
    - {type: FormField, id: salary, label: Salary, readOnlyUnless: {roles: [hr]}}
    - {type: FormField, id: notes, label: Notes, eyesOnly: {groups: [staff]}}
    - {type: Button, label: Archive, actionId: archive, disabledUnless: {roles: [manager]}}
```

## The restriction

Every key takes the same object:

```yaml
access:
  roles: [admin, manager]        # Keycloak realm/client roles, or a top-level `roles` claim
  groups: [staff]                # the `groups` claim
  scopes: [orders:write]         # `scope` (space-delimited) or `scp`
  permissions: [orders.delete]   # the `permissions` claim
```

- **AND across dimensions, OR within one.** The example needs (admin *or* manager) *and* staff
  *and* orders:write *and* orders.delete.
- A restriction with **no dimension** lets everybody through.
- **No token, or a malformed one, is denied.** Restricted content needs a Bearer token.
- Shorthand: `access: admin` or `access: [admin, hr]` lists **roles**.

The caller's identity is resolved exactly as for the annotations: the principal your framework
authenticated, or a Bearer token Mateu **verified** — never an unverified one (see
[Security](/java-user-manual/advanced/security/#how-authorization-works)).

## Where each key goes, and what it does

| Annotation (Java) | YAML key | Where | Unauthorized caller |
|---|---|---|---|
| `@EyesOnly` on a `@UI` class | `access:` | a route entry in `routes.yaml` | **403** for the route and every route nested under it (its `children`, a crud's `/new`, `/:id/edit`) |
| `@EyesOnly` on a menu field | `access:` | an app-shell menu item | the item is not sent. A `RouteLink` with no `access:` of its own **inherits its route's**, so a link to a page you cannot open is not offered. A `Menu` group left empty disappears too |
| `@EyesOnly` / `@DisabledUnless` on an action method | `access:` | an entry of a definition's `actions:` | the action is **not advertised**, every `Button` naming it is **disabled**, and a call that reaches the server anyway (dispatched, or proxied through `__restfetch__`) answers **403** |
| `@EyesOnly` on a field | `eyesOnly:` | any component of a definition | the component (and everything inside it) is removed |
| `@ReadOnlyUnless` | `readOnlyUnless:` | any component | `readOnly: true` on it and on every `FormField` inside it |
| `@DisabledUnless` | `disabledUnless:` | any component | `disabled: true` (a `Button`, a `RouteLink`, a `Menu`…); a `FormField`, which has no disabled state, becomes **read-only** |

A field that ends up hidden or read-only for the caller is also **locked on the way in**: its value
is dropped from the state the client sends, so the server keeps its own value. A read-only field
whose value the server accepted from the browser would be a suggestion, not a rule — the same
reason the `Hydrater` ignores such fields for the annotations.

### Why `access` here and `eyesOnly` there

The keys name what the restriction *does*:

- `access:` is about **reaching or invoking** something — a route you navigate to, a menu item you
  click, an action you run. Refused, it is simply not there for you (and 403 if you insist).
- `eyesOnly:`, `readOnlyUnless:` and `disabledUnless:` are **presentation states of a component**
  on a screen you *can* open. They keep the annotations' names on purpose, so a Java developer
  reads a YAML definition the same way they read a class.

A component also accepts `access:` as a synonym of `eyesOnly:`; the schema advertises `eyesOnly`.

## Enforced on the server

Nothing about a restriction is decided in the browser. For every request the server resolves the
caller's identity, rewrites the definition (or the app shell) for it **before** mapping it to the
wire, and strips the keys: what reaches the client is what this caller may see. A restriction the
browser enforced would be a suggestion — the same reason [pinned route
parameters](/java-ui-definition/route-registry/#precedence) are re-applied on the server.

Hiding is UX, not authorization. As with the annotations, the REST endpoints your screens call must
still check who is calling.

## Static bundles and Play

A statically deployed bundle has **no server and no identity** to check a restriction against, so
there the keys are cosmetic:

- `staticOnly` (`-Dmateu.bundle.static=true`) **fails the build** when a route declares `access:`
  or its definition declares any of the keys (`StaticSafetyCheck`) — exactly as it does for
  `@EyesOnly`. A screen that depends on who asks cannot be one file for everyone.
- A non-static (hybrid) bundle keeps those routes **backend-served**: they are not pre-rendered nor
  shipped as raw definitions, and the backend answers them per user.
- The browser-side expander (specs-only bundles, the visual editor's **▶ Play**) has no identity
  either: it renders the definition **as authored, unrestricted**, and warns once in the console.
  Play shows you everything; check restrictions against a running backend.

## See also

- [Security](/java-user-manual/advanced/security/) — the annotations and the token.
- [Route registry](/java-ui-definition/route-registry/) — where `access:` on a route lives.
- [App shell as data](/java-ui-definition/yaml-app-shell/) — the menu `access:` filters.
- [Translations in YAML](/java-ui-definition/yaml-i18n/) and [Environments](/java-ui-definition/environments/) — the other two pieces a YAML-only app needs.
