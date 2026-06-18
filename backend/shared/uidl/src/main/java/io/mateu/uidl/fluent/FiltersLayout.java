package io.mateu.uidl.fluent;

public enum FiltersLayout {
  /** Renderer picks the best layout using the weight formula. */
  auto,
  /** Filter controls placed directly beside the search bar. */
  inline,
  /** Filter controls hidden behind a "Filters" button with a badge counter. */
  popover,
  /** Filter controls in a persistent side drawer. */
  drawer,
  /** Filter controls in a modal dialog. */
  dialog
}
