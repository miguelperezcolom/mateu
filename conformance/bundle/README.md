# Bundle conformance corpus

The static-bundle exporters — Java's `mateu-bundle:bundle`, Python's `python -m mateu_ui.bundle`
and .NET's `dotnet mateu-bundle` — must write the SAME `manifest.json` for the same declarations.
This directory pins it.

```
conformance/bundle/
  <case>/
    specs/ui/…                  the declarations: a YAML mount every backend reads AS IT IS
    manifest.json               the normalised manifest, pre-rendered (includeParamRoutes on)
    manifest-specs-only.json    the normalised manifest in specs mode (raw definitions shipped)
    mobile-manifest.json        the bundle's mateu/v3/manifest (what the Mateu mobile app reads),
                                keys sorted, mateuVersion dropped (it is the running build's)
```

`mobile-manifest.json` pins what presents a bundled YAML-only app: the root mount's
`type: AppShell` — its `title:` (else `pageTitle:`), `logo:` (else `favicon:`) and `accentColor:` —
ahead of any app class and of the page title, plus `"bundle": "manifest.json"` (Java's
`MobileManifestFile`; the same source the installable app's web manifest is derived from).

A case is a `specs/ui` directory rather than per-language fixtures, so the three exporters bundle
literally the same input: Java reads it through a class loader serving `specs/ui/**` from the case
directory (and hiding the test classpath's route index), the ports through `MATEU_SPECS_DIR` /
`specsDir`.

## Normalisation

The manifest is compared after:

- dropping `generatedAt` (the build time);
- parsing each entry's `json` / `contentJson` (wire JSON carried as a string) and running the WHOLE
  manifest through the wire corpus's normaliser (`conformance/README.md`): generated ids,
  `serverSideType`, `targetComponentId`, `structureHash` dropped, members at their default dropped,
  keys sorted;
- sorting `entries` by `route` (their order is the discovery order, a detail).

Everything else is pinned: which routes are bundled and under which sync path, both loads of a
route under an app shell (the shell aimed at the route + its content), the authored route table,
the REST source catalogue (with its AUTHORED provenance), the required capabilities, the raw
definitions (field types resolved, partials and business components inlined, the mount's home
stamped into its shell), the action catalogue, the translations — and `${i18n.…}` left AS WRITTEN
in the pre-rendered entries, for the browser to resolve per visitor.

## Running it

| Server | Command |
|---|---|
| Java | `cd backend/shared/core && mvn test -Dtest=BundleConformanceTest` |
| Python | `cd backend/python && python -m pytest tests/test_bundle_conformance.py` |
| .NET | `cd backend/dotnet && dotnet test --filter BundleConformance` |

Regenerating the goldens (Java only, and a reviewed act — then frozen, as the wire corpus):

```bash
cd backend/shared/core && mvn test -Dtest=BundleConformanceTest -Dconformance.write=true
```

## Known differences

None. `yaml-shell` carries a `:param` route (`missions/:missionId`, a definition-only page): the
three exporters bundle it as a template, and its content load is the BARE layout — a path parameter
alone is no seed (Java's `ActionInstanceCreator.seedBareLayout`; the wire cases
`definition-path-params` / `-seeded` pin both sides of that rule).
