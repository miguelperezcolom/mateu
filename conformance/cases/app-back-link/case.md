# app-back-link

`@App(backLink = PARENT)` (.NET `[App(BackLink = BackLink.Parent)]`, Python
`@app(back_link=BackLink.PARENT)`): the app offers ONE "← Parent" link instead of the breadcrumb
trail — the OCI-console style for a record master opened from a listing.

Pins, on the app shell:

- `backRoute`: the nearest route ABOVE the app's own that resolves to a screen (`/conformance` for
  the app at `/conformance/app-back-link`), found by walking up its path one segment at a time;
- `backLabel`: that screen's title (`Records`, its `@Title`), resolved server-side — else its last
  segment humanized;
- `noBreadcrumbs`: true (the link replaces the trail).
