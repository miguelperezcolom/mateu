# hero-search-filters

Pins a hero search page over a declarative listing with its OWN filters type (Java's
`HeroSearch<Filters, Row>`, .NET's `HeroSearch<TFilters, TRow>`, Python's
`HeroSearchListing[F, R]`): a full-width `STRETCH` vertical layout (no Page frame) holding a
centered `HeroSection` (title + subtitle) over the listing; the listing's facet bar is the
FILTERS type (not the row), it lays out `inline`, results render as `cards`, the page type is
`landing`, and it starts EMPTY — no `OnLoad`→`search` trigger. It is not a CRUD, so the action
list (`search` + the open row/view wildcards) is pinned.
