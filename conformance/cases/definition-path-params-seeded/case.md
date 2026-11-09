# definition-path-params-seeded

The `definition-path-params` page whose route ALSO declares `defaultParams` — a seed — loaded at
`/missions/6`.

What it pins (Java's `ActionInstanceCreator.seedBareLayout` + `RouteSegmentUtils.addParameterValues`):

- a route that seeds wraps the layout in a server-side component, and its state carries every
  parameter by the precedence `fixed > client state > path > query > defaults` — the default
  (`tab`) AND the path parameter (`missionId`);
- the window title interpolates against that state (`Mission 6`).
