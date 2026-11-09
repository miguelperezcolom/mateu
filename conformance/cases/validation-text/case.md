# validation-text

**Pins:** the TEXT constraints on the wire, next to `validation`'s required/number ones. A length
bound (`@Size` / .NET `[StringLength]`, `[MinLength]`, `[MaxLength]` / Python `Length`) sends one
`validations` entry PER BOUND it declares, whose condition holds for an absent value and for a value
without a length, and whose default message names both bounds — an open maximum is printed as
`2147483647` (Java's `Integer.MAX_VALUE`). A pattern (`@Pattern` / `[RegularExpression]` /
`Pattern`) sends the regexp verbatim inside a JS literal tested with `RegExp.test` (find, not a
full match — the server checks it the same way), passing an absent value; default message
`Invalid format`. Custom messages travel as written. Order per field: length, pattern, then the
required check. A `@Hidden("expression")` field's constraint is relaxed while it is hidden
(`(expr) || (condition)`).

The server-side leg (the same constraints re-checked before a `validationRequired` action and on a
CRUD save / `update-row`, a hidden-in field skipped) is pinned by each server's own suite.
