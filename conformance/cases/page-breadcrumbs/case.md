# page-breadcrumbs

A page that DECLARES its trail: Java `@Breadcrumbs({@Breadcrumb(label, url), …})` (or a
`BreadcrumbsSupplier`, which wins), .NET `[Breadcrumb(label, url)]` repeated (or
`IBreadcrumbsSupplier`), Python `@breadcrumbs(("label", "url"), …)` (or `BreadcrumbsSupplier`).

Pins, on the page: `breadcrumbs` — the crumbs in declaration order, each `{text, link}`.
