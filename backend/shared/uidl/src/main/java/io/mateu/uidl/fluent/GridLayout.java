package io.mateu.uidl.fluent;

public enum GridLayout {
  /** Renderer picks the best layout using the weight formula. */
  auto,
  /** Classic tabular grid. */
  table,
  /** Two-line compact list (primary + secondary info per row). */
  list,
  /** Card tiles — preferred when image/html stereotypes are present. */
  cards,
  /** Split panel: row list on the left, detail view on the right. */
  masterDetail
}
