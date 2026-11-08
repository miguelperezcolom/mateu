# crud-hidden-constraints-edit

**Pins (a second request: `/S-1/edit`):** the edit form of the `crud-hidden-constraints` CRUD —
`@HiddenInEditor quota` is not on it and its `@Min`/`@Max` send no validation, while
`@HiddenInCreate @Min(100) @Max(999) code` is on it with its bounds. Mediated like `crud-edit`.
