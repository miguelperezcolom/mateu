# simple-form

**Pins:** the basic field kinds and what they imply on the wire — a string, an int, a boolean, a
date and an enum, grouped by one `@Section`, with the labels, `dataType`s and enum options the
servers must derive from them.

Chosen first because it is the smallest thing every server must agree on: if two servers disagree
about what a plain form looks like, nothing above it can be compared.

## Known divergence — Python

**Structural, not cosmetic.** Java wraps a `@Section` in a `Card` and hangs the rows off
`metadata/content`; Python nests them directly under `children`. Of 59 Python key-paths and 106 Java
ones, only 27 are shared.

That is not a formatting difference a renderer can absorb: a renderer walking `metadata.content`
finds nothing in the Python output. Either the section shape is part of the contract and Python must
emit it, or the contract should describe both — and that is a decision, which is precisely what the
corpus exists to force into the open instead of leaving it discovered per renderer.

Tracked as an xfail in `backend/python/tests/test_wire_conformance.py`.
