# Example 4 — page archetypes and the app shell

**Example 4** of the progressive Star Wars suite. Example 3 built rich single screens; this one moves
up an altitude to **page archetypes** and the **app shell** — the developer still declares only data,
and Mateu infers the dashboard layout, the navigation chrome and the command-center palette.

## The dashboard archetype — `GalaxyDashboard` (`/dashboard`)

`extends Dashboard`: consecutive `MetricCard` fields become a scoreboard band, and `@Panel` component
fields become titled tiles on a responsive grid. No layout code.

```java
@UI("dashboard") @Title("Galaxy dashboard")
public class GalaxyDashboard extends Dashboard {
  MetricCard characters = MetricCard.builder().title("Characters").value("82").trend(up)…;
  MetricCard planets    = MetricCard.builder().title("Planets").value("60")…;
  // …a scoreboard of four…
  @Panel(title = "Records per collection", colSpan = 2) Chart counts = …bar…;
  @Panel(title = "Films per era")                       Chart era    = …pie…;
}
```

## The app shell — `Home4` (root)

`@App(commandCenter = true)` gives the whole navigation chrome plus the always-present command-center
FAB (a full-screen palette unifying navigation, recents and search). Each `@Menu` field is a routed
screen; `HomeRouteSupplier` names the landing route.

```java
@UI("") @Title("Star Wars — app shell") @App(commandCenter = true)
public class Home4 implements HomeRouteSupplier {
  @Menu GalaxyDashboard dashboard;
  @Menu Planets planets;
  @Override public String homeRoute() { return "dashboard"; }
}
```

> **Note.** A reflected `@App` POJO shell does not currently default its home route to the first menu
> item (that default is applied for YAML-defined apps), so opening the root would show an empty content
> area. Implementing `HomeRouteSupplier` names the landing route explicitly and is the robust way to do
> it for a Java shell.

## The step from Example 3

Example 3 was screens; Example 4 is the *application* around them — a dashboard composed from metric
cards and charts, a menu, and the command center — all still inferred from declarations. Next in the
suite: federation (a shell aggregating independent modules) and a static bundle with no backend.

## Run it

```bash
cd demo/demo-starwars-4-app
mvn -s ../../settings.xml spring-boot:run     # → http://localhost:8603
```

Open <http://localhost:8603> — the dashboard is the landing screen; the menu switches to **Planets**
(a CRUD), and the blue **command-center** button (bottom-right) opens the palette.
