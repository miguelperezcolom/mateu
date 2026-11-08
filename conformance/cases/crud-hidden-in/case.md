# crud-hidden-in

**Pins (the content load, like `crud`):** a CRUD whose entity hides fields per surface —
`@HiddenInList notes` is not a column — and names its `@MainFilter` (the filter carries
`mainFilter`). The `crud-hidden-in-edit` and `crud-hidden-in-new` cases pin its forms.

Worth pinning because the ports had no `HiddenIn*` or `MainFilter` before 3.0 GA. Mediated like
`crud` (see the README's "Known port differences").
