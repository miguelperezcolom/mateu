# page-header

**Pins:** the canonical page header — `@Title`, `@Subtitle`, `@Overline`, a `@KPI` fact and a
`@Timestamp` — and that the fields backing the header are excluded from the form body.

Chosen because the header is the most cross-cutting surface in the framework: every template reuses
it, and it is where the ports have historically drifted one small member at a time.

## Divergence — Python (narrowed 2026-08-12)

It started at **38** members Java emitted and Python did not. Most were **falsy defaults**
(`false`, `0`, `""`): a renderer cannot tell "absent" from "default", so comparing them was the
corpus reporting noise. Both normalisers now drop them, and the gap is down to **13**.

What is left is a genuine contract question, and the corpus exists to make it askable per member
rather than per renderer:

| Member | Java | Python | Question |
|---|---|---|---|
| `cssClasses` | `"mateu-section"` | absent | Is the section's CSS class part of the wire contract, or a Vaadin-renderer convenience? |
| `optionsColumns` | `1` | absent | Non-falsy defaults. Equivalent to a renderer — but "the default of `optionsColumns` is 1" is knowledge the corpus does not have. |
| `sliderMax` / `sliderMin` | `100` / `0` | absent | idem |
| `expandColumns` | `true` | absent | A default of `true`: the one shape normalisation cannot guess at all. |

**Not resolved by normalisation on purpose.** Inventing a defaults table would encode one server's
opinion as the contract, which is the thing this corpus was built to stop. The two ways out are: the
DTOs declare their defaults (and both sides read them), or the ports emit members explicitly. Either
is a decision.

Tracked as an xfail in `backend/python/tests/test_wire_conformance.py`.
