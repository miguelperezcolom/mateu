# section-options

**Pins:** `@Section(sticky = true)` (the card pinned while the page scrolls: the
`mateu-section--sticky` marker class and its sticky style) and `@Section(columns = 1, style =
"gap: 0;")` (an explicit column count winning over the form's inferred two, and a style on the
section's content), on a form of eight fields.

Worth pinning because the ports' `Section` had no `sticky`, `columns` or `style` before 3.0 GA.
