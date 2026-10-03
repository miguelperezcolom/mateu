package io.mateu.uidl.annotations;

/**
 * How a screen offers the way back up (decision D3 of the MAUI parity plan): the automatic
 * breadcrumb trail, or a single "← Parent" link labelled with the parent's title — the OCI-console
 * style, for a record master whose parent is the listing it was opened from.
 */
public enum BackLink {
  /** The automatic breadcrumb trail (the default). */
  BREADCRUMBS,
  /**
   * A "← Parent" link to the nearest route above this one that resolves to a screen, labelled with
   * that screen's title; the pages inside this app show no breadcrumb trail.
   */
  PARENT
}
