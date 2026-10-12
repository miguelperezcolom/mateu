# dashboard

**Pins:** the `Dashboard` archetype's composition on the wire — consecutive `MetricCard` fields grouped into one `Scoreboard` band (each card a `MetricCard` child carrying title/value/unit/trend/trendLabel, trend as a lowercase string), a `@Panel` component field wrapped in a titled `DashboardPanel` tile (title/subtitle/colSpan/rowSpan, content as a child), all inside a `DashboardLayout` grid. Chosen because it is the first archetype in the corpus: unlike a reflected form, the server COMPOSES this page from field conventions, so all three composers (Java `DashboardComposer`, .NET `ArchetypeComposers.ComposeDashboard`, Python `mapper.compose_dashboard`) must agree not just on member names but on grouping order and nesting. It also pins the tree-supplier envelope, where the ports are known to add a `Page` wrapper Java does not emit.

## Window title

The view declares a title, so the increment carries a `SetWindowTitle` command although a component tree is no reflected page (no Page wrapper in any of the three servers). Without it the browser tab kept the previous page's title and screen readers heard no navigation. (The envelope divergence this section used to predict was closed in the ports: their allow-lists are empty.)
