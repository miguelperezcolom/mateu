# demo-redwood-showcase

A permanent, self-contained showcase for the **Oracle Redwood (Oracle JET)** renderer. It bundles
`redwood-oj-lit`, so the screens are served with the Redwood UX natively — no dev-server proxy
needed — and can be used to review the renderer's chrome, navigation and UX patterns, or as the
target app when taking Redwood screenshots.

## Screens

| Route        | Class                | Pattern                                                        |
|--------------|----------------------|---------------------------------------------------------------|
| `/`          | `ShowcaseApp`        | App shell (`HAMBURGUER_MENU`, dark left rail, theme toggle)    |
| `/dashboard` | `OverviewDashboard`  | `Dashboard` archetype — scoreboard band + `@Panel` tiles       |
| `/catalog`   | `Catalog`            | `AutoCrud` listing — cards, status badges, pagination, search  |
| `/guest`     | `GuestProfile`       | `@Zones` form — sections, field types, header badge            |
| `/booking`   | `BookingWizard`      | `Wizard` with the Redwood "Guided Process" rail (`RAIL`)       |

## Run

```bash
cd demo/demo-redwood-showcase
mvn spring-boot:run
# → http://localhost:8595
```

The Redwood frontend assets come from the `redwood-oj-lit` artifact. After changing the renderer
source under `frontend/web/monorepo/apps/redwood-oj/`, rebuild and reinstall the bundle so this app
picks the changes up:

```bash
cd frontend/web/monorepo/apps/redwood-oj && yarn copy
cd backend/shared/frontend/redwood-oj-lit && mvn install -DskipTests
```

## Screenshots

```bash
cd e2e
node screenshot.mjs --url http://localhost:8595/catalog --output /tmp/catalog.png --settle 6000
# dashboard / wizard render no <mateu-page>; wait for the root component instead:
node screenshot.mjs --url http://localhost:8595/dashboard --output /tmp/dash.png --wait-for mateu-ui --settle 7000
```
