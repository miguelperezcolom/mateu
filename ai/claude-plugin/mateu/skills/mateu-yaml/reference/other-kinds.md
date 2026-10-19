# The other file kinds

All of these live anywhere under `specs/ui/` (recognised by `type:` / shape, except where a folder
is noted), merge with a code supplier when there is one, and **YAML wins**.

## Action catalogue — `type: Actions`

Named client-runnable actions, run by id from a menu `RuleLink`, a header action, or any page's
button. A page's / shell's own action of the same id wins (owner first).

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Actions
actions:
  - id: newOrder
    description: Start a new order
    steps:
      - {type: MarkClean}
      - {type: Navigate, route: orders/new}
  - id: refreshCustomers
    restAction:
      source: {ref: customers-refresh}
      successMessage: Refreshed
```

An entry with neither `steps` nor `restAction` is ignored with a warning (server logic stays a
view-model method).

## Field types — `type: Types`

The domain vocabulary, declared once: a `FormField`/`GridColumn` with `fieldType: X` takes the
type's attributes as defaults (its own keys win).

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Types
types:
  - id: OrderStatus
    label: Status
    dataType: status
    options:
      - {value: OPEN, label: Open}
      - {value: SHIPPED, label: Shipped}
    tones: {OPEN: warning, SHIPPED: success}
  - id: Money
    dataType: money
    align: end
```

Use: `{type: GridColumn, id: status, fieldType: OrderStatus}`,
`{type: FormField, id: total, label: Total, fieldType: Money}`.

## Translations — `type: Translations`

`translations/<locale>.yaml` (the file name is the locale), or anywhere with `locale:`. Nested keys
flatten with dots; any YAML text takes `${i18n.key}`, resolved per request locale (served) or in
the browser (static bundle).

```yaml
# specs/ui/translations/es.yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Translations
messages:
  orders: {title: Pedidos, new: Nuevo pedido}
```

`title: ${i18n.orders.title}`. Provide a file per locale you support (the browser's
`Accept-Language` picks it).

## Environments — `type: Environment`

`environments/<name>.yaml`, activated with `MATEU_ENVIRONMENT=<name>` / `-Dmateu.environment` on a
served app, or `-Dmateu.bundle.environment=<name>` when building a bundle. Overrides per source
name: `baseUrl`, `url`, `headers`, `proxy` — **never secrets** (use `${secret.X}` + proxy). The
overlay keeps the source's sample data.

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
type: Environment
sources:
  orders: {baseUrl: https://pre.api.example.com}
  payments: {url: https://pre.pay.example.com/v1/payments, proxy: true}
```

## Project settings — `type: Project`

One per project (`specs/ui/project.yaml`): `renderer: vaadin | redwood`. Read by the visual editor,
Play, the IDEs and `mateu-bundle:bundle` (`-Dmateu.bundle.renderer` overrides). A served app's
renderer is still its dependency (`io.mateu:mateu-vaadin` / `io.mateu:mateu-redwood`); the server
warns when they differ.

## Business components — `components.yaml`

Named, bound compositions (e.g. an agency select fed by a source), referenced with
`{type: ComponentRef, ref: AgencySelector}`. Resolved by the server, or by the browser in a static
bundle; an unknown name renders a placeholder.

```yaml
$schema: https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json
components:
  - name: AgencySelector
    component:
      type: FormField
      id: agency
      label: Agency
      stereotype: select
      optionsSource: {ref: agencies}
```

## Access keys (permissions) in YAML

Same dimensions as Java's `@EyesOnly`: `{roles, groups, scopes, permissions}` (AND across
dimensions, OR within one). Applied **server-side per request** from the identity the host
framework authenticated (Mateu does not authenticate):

| Where | Key | Effect |
|---|---|---|
| route entry | `access:` | 403 for that route and everything nested; menu links hidden |
| menu entry / catalogue or page action | `access:` | hidden / not advertised, buttons disabled, 403 if called |
| component (field, button…) | `eyesOnly:` | removed (and its state dropped) |
| component | `readOnlyUnless:` | read-only unless authorised |
| component | `disabledUnless:` | disabled unless authorised |

In Play and static bundles they are cosmetic (everything shows); `staticOnly` refuses them — a
bundle is one file for everyone.
