# mateu-vaadin

The Vaadin (Lumo) web renderer of [Mateu](https://mateu.io): the `<mateu-ui>` element that draws any
Mateu UI — a Java, C#, Python or YAML backend, or a static bundle — served on the `/mateu/v3` wire.

The package is a self-contained ES module bundle (Lit, the Vaadin components and Mateu's client are
inside it), published at the same version as each Mateu release. Every Mateu app that depends on
`io.mateu:mateu-vaadin` also serves the same file at `/assets/mateu-vaadin.js`.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/mateu-vaadin@<version>/dist/assets/mateu-vaadin.js"></script>

<mateu-ui baseUrl="https://your-app.example.com"></mateu-ui>
```

Pin `<version>` (e.g. `3.0.0-beta.58` for Mateu `v3.0-beta.58`) to the Mateu release your backend runs (the renderer and the server speak one wire
major). Guide: [Embedded UI](https://mateu.io/java-user-manual/use-cases/embedded-ui/).

Apache-2.0.
