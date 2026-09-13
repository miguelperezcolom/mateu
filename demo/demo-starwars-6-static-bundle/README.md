# Example 6 — a static bundle (no backend)

**Example 6**, the capstone of the progressive Star Wars suite. The whole ladder ends here: the
declared screen compiles into a **static SPA** — `index.html` + `manifest.json` + `assets/` — that
any static host or CDN serves with **no Mateu backend at all**, and the browser fetches live data
straight from the external Star Wars API.

## What it demonstrates

`Home` is a plain `@UI` form. Its **structure** is fully pre-rendered into the bundle at build time
(the `manifest.json` carries the increment), and its two selects fetch their options **client-side**
from named entries of `specs/ui/sources.yaml`:

```java
@UI("") @Title("Star Wars — static bundle")
public class Home {
  private String name;
  @RestOptions(source = "swapi-planets") private String homeworld;   // live from swapi, no backend
  @RestOptions(source = "swapi-people")  private String mentor;
}
```

The `mateu-bundle` Maven goal writes the static site:

```bash
mvn -Pbundle package        # → target/mateu-bundle/  (index.html + manifest.json + assets/)
```

Every source this demo uses is **external** (the Star Wars API), so — unlike `demo-static-bundle`,
which also derives an OpenAPI + a server for its *own* endpoints — there is nothing to generate: only
the `bundle` goal runs. The catalogue travels in `manifest.json`, so re-pointing the deployment at
another environment is an edit of that table, not a rebuild.

## Serve it with no backend

```bash
cd target/mateu-bundle
python3 -m http.server 8605        # or drop the folder on any CDN / static host
```

Open <http://localhost:8605> — the form renders and the **Homeworld** / **Mentor** selects populate
live from `swapi.ec1.mateu.io`, with no Mateu server anywhere in the picture.

## The step from Example 5

Examples 1–5 were served by a backend (or aggregated backends). Example 6 removes the backend
entirely: the same kind of declared screen, compiled once and shipped to a CDN, still live because
the data comes from an external API the browser calls directly. Declared once — rendered as code,
served by a backend, federated, and now shipped as a static bundle: the full spectrum.

> Building this example surfaced (and fixed) a framework bug: a by-`ref` `@RestOptions` was baking the
> annotation's default `valuePath`/`labelPath` (`"value"`/`"label"`) into the wire, which then won over
> the catalogue's mapping — so the selects fetched their data but showed blank labels. The mapper now
> leaves those paths blank for a by-ref source so the catalogue supplies them.
