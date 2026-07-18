package io.mateu.uidl.data;

import java.util.List;

/**
 * A listing filter condition that the entity-shaped (query-by-example) filters object cannot
 * express: date/number ranges and value lists. The framework builds them from the component state
 * ({@code <field>_from}/{@code <field>_to} keys, multi-select value lists) with the values already
 * coerced to the field's type, and hands them to {@code CrudStore.find(searchText, filters,
 * criteria, pageable)} alongside the example object, which keeps carrying the plain equality
 * filters.
 *
 * @param field the filter field name on the row/filters class
 * @param operator the condition semantics; dictates how many {@code values} are expected
 * @param values {@code between}: [from, to] — {@code gte}/{@code lte}: [bound] — {@code in}: the
 *     accepted values
 */
public record FilterCriterion(String field, FilterOperator operator, List<Object> values) {}
