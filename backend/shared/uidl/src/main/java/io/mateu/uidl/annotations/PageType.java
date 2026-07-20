package io.mateu.uidl.annotations;

/**
 * The coarse type of a page, in the vocabulary of the Oracle Redwood page templates. Selected with
 * {@link PageTemplate}; when absent, Mateu infers it from the ModelView's shape (see {@code
 * PageTypeResolver} — archetypes declare theirs, a {@code ListingBackend} is a collection page, a
 * dashboard shows through its metric cards, a plain reflected form is a form page).
 *
 * <p>The type anchors the page's anatomy defaults (e.g. its default width) and gives the wire a
 * shared vocabulary for conformance and docs.
 */
public enum PageType {

  /** Landing/entry pages — the Welcome and Hero Search templates. */
  LANDING,

  /**
   * Collection pages — listings, search pages, CRUDs, to-do lists, calendars, collection detail.
   */
  COLLECTION,

  /** Record/overview pages — general/item overview, foldout, waterfall, master-detail. */
  DETAIL,

  /** Form pages — the Create &amp; Edit family (simple and advanced). */
  FORM,

  /** Guided process pages — wizards and import wizards. */
  PROCESS,

  /** Dashboard pages — KPI scoreboards and chart tiles. */
  DASHBOARD
}
