package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;

/**
 * The command palette's entity search, fed by a REST source instead of a {@code
 * GlobalSearchSupplier} app class — the data twin of that interface. The source is called with
 * {@code ${state.searchText}} to interpolate, and its items (at its {@code itemsPath}) are read as
 * {@code label}, {@code description}, {@code route} and {@code category}, each through the
 * catalogue entry's field map when it has one.
 *
 * @param source the search endpoint
 */
@Experimental("YAML app shell extras (3.0 beta)")
public record AppGlobalSearchSource(RestDataSource source) {}
