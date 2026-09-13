# zones

Pins the multi-column zoned form layout: `@Zones`/`@Zone` (Java), repeatable `[Zone]` (.NET) and `@zones(...)` (Python) must all emit one HorizontalLayout row with `wrap`, containing one column per declared zone, each column carrying the hand-maintained responsive style `flex: 1 1 calc(<width> - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);`, with each `@Section(zone=...)` card stacked inside its declared column. Worth pinning because the style string and the section-distribution logic are duplicated by hand in all three backends (SectionFormRenderer.renderZones, ReflectionMapper.BuildZones, mapper.build_zones) — a drift in any of them silently changes where a renderer breaks the row, i.e. the page's whole structure at narrow widths, per server.

## Known divergence

Python is expected to xfail with the same STRUCTURAL section divergence already documented for simple-form: Java (and .NET) wrap each `@Section` in a Card and hang the form rows off `metadata/content`, while Python nests the section content directly under `children` — here it applies inside BOTH zone columns, so the column style strings will agree (all three emit the identical `flex: 1 1 calc(64% - var(--lumo-space-m, 1rem)); min-width: min(20rem, 100%);`) but the card shape inside each column will not. Same contract decision as simple-form, not a new gap.
