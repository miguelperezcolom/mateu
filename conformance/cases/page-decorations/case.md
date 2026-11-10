# page-decorations

**Pins:** the page's own blocks declared on fields — `@Avatar` (`PageDto.avatar`, one component),
`@Header` and `@Footer` (`PageDto.header` / `.footer`, lists of components) — mapped as ordinary
client-side components and NEVER drawn in the form body as well (Java drew them twice until
2026-11-10, `FormFieldFilter.isPageDecoration`). The Avatar block carries Java's sizing style
(`;width: 4rem;height: 4rem;`). The fixture's blocks are not part of the state.

Ports: .NET `[Avatar]`/`[Header]`/`[Footer]` on component properties, Python `Avatar()`/`Header()`/
`Footer()` markers.
