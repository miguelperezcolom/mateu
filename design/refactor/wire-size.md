# Wire size: measured candidates for a post-GA `wireVersion` minor

Status: **recorded, not scheduled.** Nothing here changes before GA — every item is a change to
the JSON shape that the four renderers (and any third-party renderer) read today.

Reproduce with `node scripts/wire-size.mjs` (`--json` for the raw numbers). It reads the 39
conformance goldens (`conformance/cases/*/expected.json` — the exact `UIIncrementDto` the Java,
.NET and Python servers emit), re-serializes each compactly, and gzips it at level 9.

## Baseline (integration/coverage, 2026-10-17)

| | raw | gzip |
|---|---:|---:|
| 39 cases | 58,312 B | 19,794 B (×2.95) |
| FormField keys at their default value | 3,625 B (6.2%) | 769 B (3.9%) |
| `initialData` repeating the fragment's `state` | 909 B (1.6%) | — |
| `ClientSide` envelopes (306 nodes) | ~10,098 B (17.3%) | — |

The gzip column for the last two is not computed: removing them changes the repetition gzip feeds
on, and the defaults row already shows how much smaller the gain gets after compression (6.2% raw
→ 3.9% gzip).

## Candidates

1. **Omit FormField defaults** — `sliderMax: 100`, `optionsColumns: 1`, `colspan: 1`,
   `stereotype: "regular"` travel on every field. Renderers would have to apply the defaults
   themselves; the TS DTOs, the Redwood reducer, RN and IntelliJ all read these keys today.
2. **Deduplicate `initialData`** — a ServerSide component's `initialData` repeats the state its
   fragment already carries (`simple-form`: 78 B). The client would seed from the fragment state.
3. **Flatten the `ClientSide` envelope** — `{"type":"ClientSide","metadata":{"type":X,…}}` around
   every client node is the largest share raw, and almost free after gzip (it is the most
   repetitive string on the wire). It is also the discriminator every renderer dispatches on: the
   most invasive of the three.

## Why not now

- **HTTP compression is the bigger lever** and needs no wire change: ×2.95 over the corpus. It is
  off by default in Spring Boot and Quarkus; the production checklist
  (`doc/.../deploy/production-checklist.md`, "Compress the responses") now says so.
- Over gzip, the measurable win of (1) is ~4% of bytes. That does not pay for a lockstep change in
  three servers and four renderers before GA.
- The structure cache already removes the whole component from repeated loads of a route (the
  client echoes `knownStructureHash`), so steady-state traffic is mostly state and data, which none
  of these candidates touch.

## If it is ever done

Bump `wireVersion` (minor), decide how a renderer that predates it is served (the third-party ones
included), and regenerate the conformance goldens in all three servers at once.
Re-run `scripts/wire-size.mjs` before and after and put both tables in the PR.
