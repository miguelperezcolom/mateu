package io.mateu.uidl.data;

/** Operator of a {@link FilterCriterion} — the conditions query-by-example can't express. */
public enum FilterOperator {
  /** Value within [values(0), values(1)], both inclusive. */
  between,
  /** Value ≥ values(0). */
  gte,
  /** Value ≤ values(0). */
  lte,
  /** Value equal to any of the values. */
  in
}
