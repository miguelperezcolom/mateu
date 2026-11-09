# definition-proxied-listing

Pins a DEFINITION-ONLY page (no view model, served from this case's own `specs/ui/`) whose listing
rows and select options come from PROXIED catalogue entries (`sources.yaml`: `proxy: true`, an API
key in a `${secret.X}` header) — Java's `SeededYamlPage` as a `RestSourceSupplier` for its layout's
`rowsSource` / `optionsSource`.

What it pins:

- the page declares no action, seeds nothing and declares no page type, yet it is WRAPPED in a
  server-side component — because it reads a proxied source, which only a server-side page can
  fetch;
- it advertises exactly `__restfetch__` (the browser asks this server for the rows, kind `rows`, by
  the listing's id, and for the options, kind `options`, by the field's id) — without it the
  listing stayed on "Search to see results." with nothing in any log;
- the surfaces carry only the catalogue `ref`; the response carries the two catalogue entries they
  name (`restSources`), and neither the entries nor the surfaces carry the secret header;
- a page whose root is a VerticalLayout stays a `form` page (only a root `type: Listing` is a
  collection).

The proxied fetch itself (the second request) calls the endpoint, so it is pinned by each port's
own tests (Java `SeededYamlPageRestSourcesTest`, .NET `YamlDefinitionTriggersAndSourcesTests`,
Python `test_yaml_definition_triggers_and_sources.py`) rather than by the corpus.
