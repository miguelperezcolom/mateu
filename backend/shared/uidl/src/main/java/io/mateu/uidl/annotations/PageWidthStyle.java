package io.mateu.uidl.annotations;

/**
 * How a page's content column is sized within the viewport. Selected with {@link PageWidth} or the
 * {@code PageWidthSupplier} hook; when neither is present the renderer infers it from the page
 * content (full-bleed canvases like gantt/planning boards → edge-to-edge, dense inline-editing
 * datagrids → full width, anything else → fixed).
 *
 * <p>The names follow the Oracle Redwood page templates, where this is the template's first
 * parameter.
 */
public enum PageWidthStyle {

  /**
   * The content column grows to {@code 1392px} (Redwood) and is then centered: fluid with side
   * margins on smaller viewports, fixed with growing margins on wide ones — the canvas background
   * stays visible at the sides. The Redwood default for most templates (text and forms read worse
   * when too wide). The Redwood renderer follows the Spectra shell, which measures 1408px.
   */
  FIXED,

  /**
   * The content column is never capped: its side margins ({@code 24px} in Redwood) grow from a
   * 1440px viewport up to {@code 96px}, and from there the content keeps growing. The Redwood "Full
   * Width" variant, typical of dense data pages (tables, data grids, Gantt charts).
   */
  FULL_WIDTH,

  /**
   * The content touches the viewport edges (no side margins) — for full-bleed canvases such as
   * foldout layouts, gantt charts or planning boards. The Redwood "Edge to Edge" variant.
   */
  EDGE_TO_EDGE
}
