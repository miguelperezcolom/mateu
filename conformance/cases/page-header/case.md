# page-header

**Pins:** the canonical page header — `@Title`, `@Subtitle`, `@Overline`, a `@KPI` fact and a
`@Timestamp` — and that the fields backing the header are excluded from the form body.

Chosen because the header is the most cross-cutting surface in the framework: every template reuses
it, and it is where the ports have historically drifted one small member at a time.

## Known divergence — Python

**Cosmetic, and close.** 64 of Python's 67 key-paths are shared with Java's 105. The gap is almost
entirely Java emitting optional members Python omits — `cssClasses`, `autofocus`, `bold`,
`description`, `formColumns`, `inlineEditing` — plus Python emitting `initialValue` and a
`targetComponentId` Java leaves absent.

Worth resolving in the normaliser rather than in the ports **if** those members are genuinely
optional to a renderer: a corpus that fails on members nobody reads teaches people to ignore it. The
question "is this member part of the contract or an implementation detail?" is now answerable per
member, which it was not before.

Tracked as an xfail in `backend/python/tests/test_wire_conformance.py`.
