package io.mateu.uidl.fluent;

public enum GridLayout {
  /**
   * Undeclared: the listing renders as a {@link #table}.
   *
   * <p>It used to be measured — column weight against the available width — and came out a table,
   * a list, cards or a master/detail split depending on the result, so the same screen looked
   * different on a narrower window or once a column was added, with nothing in the model saying
   * so. A listing that wants to be something other than a table now says which.
   */
  auto,
  /** Classic tabular grid. */
  table,
  /** Two-line compact list (primary + secondary info per row). */
  list,
  /** Card tiles — preferred when image/html stereotypes are present. */
  cards,
  /** Split panel: row list on the left, detail view on the right. */
  masterDetail,
  /** Hierarchical tree grid — rows carry a self-referential {@code children} list. */
  tree
}
