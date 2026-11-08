# bulk-actions-unlabeled

**Pins the label of an UNLABELLED bulk button on a plain listing** (no interaction capability):
Java's `PageListingBuilder` labels it with the bare method name — `markRead`, not humanised, not
translated — in the listing's toolbar and in the page header's (the ports camelCase the method
name: Python `mark_read`, .NET `MarkRead`). A CRUD's, and a bridged listing's, unlabelled bulk
button is humanised instead (`FieldMetadataExtractor.getLabel`); the bare name here is arguably a
Java oversight, kept because Java is the reference.
