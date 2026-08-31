# simple-form

**Pins:** the basic field kinds and what they imply on the wire — a string, an int, a boolean, a
date and an enum, grouped by one `@Section`, with the labels, `dataType`s and enum options the
servers must derive from them.

Chosen first because it is the smallest thing every server must agree on: if two servers disagree
about what a plain form looks like, nothing above it can be compared.

## Divergence — Python: STRUCTURAL

Unaffected by the normalisation that narrowed `page-header`, because it is not about members: it is
about **where the fields live**.

Java wraps a `@Section` in a `Card` and hangs the rows off `metadata/content`; Python nests them
directly under `children`. The field data itself agrees — same `fieldId`, same `dataType` — but at
different paths.

That is not a difference a renderer can absorb: one walking `metadata.content` finds nothing in the
Python output.

**This is a contract decision, not a bug to route around.** Either the section shape is part of the
contract and Python must emit it, or the contract has to describe both — and choosing needs someone
who owns the wire, which is exactly the conversation the corpus was built to force into the open
instead of leaving it to be discovered renderer by renderer.

Tracked as an xfail in `backend/python/tests/test_wire_conformance.py`.
