package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;

/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). Children are placed on a
 * CSS grid whose column tracks are sized with the #8 vocabulary ({@link GridTrack}: hug=auto,
 * fill=1fr, fixed=len), so form columns, zones, dashboards and template slots can all be expressed
 * as one grid instead of five specialized mechanisms. This is the foundation + escape hatch, not
 * the default authoring mode — inference still builds columns by default.
 *
 * <p>v1 carries explicit column tracks and an optional per-child column span ({@code colSpans},
 * aligned with {@code content}: a child with span N occupies N tracks — this is what a full-width
 * band or a wide dashboard tile needs, so the scattered column mechanisms can converge here).
 * Responsive breakpoints and named areas are follow-ups.
 */
public record ResponsiveGrid(
    String id,
    List<GridTrack> columns,
    String gap,
    List<Component> content,
    List<Integer> colSpans,
    /**
     * Responsive breakpoint (coherence-plan #9): a CSS length below which the grid collapses to a
     * single column (the tracks apply at or above it). This is what makes the grid genuinely
     * responsive — a ratio layout (e.g. 64%/36% zones) keeps its ratio on wide viewports and stacks
     * on narrow ones, using CSS grid + a container query, not a flex fallback. Null = never
     * collapse (the tracks always apply).
     */
    String stackBelow,
    /**
     * Named-slot template (coherence-plan #7): a CSS {@code grid-template-areas} value (e.g. {@code
     * "header header" "sidebar main"}). A child whose {@code slot} matches an area name is placed
     * in that area — this is a Screen's Template + slots realised on the one grid (#9). Null = no
     * named areas (children flow into the column tracks in order). A child with no matching slot
     * flows into the implicit overflow (the plan's "fixed skeleton + overflow area" default).
     */
    String gridTemplateAreas,
    String style)
    implements Component {

  public ResponsiveGrid(String id, List<GridTrack> columns, List<Component> content) {
    this(id, columns, null, content, null, null, null, null);
  }

  public ResponsiveGrid(
      String id, List<GridTrack> columns, String gap, List<Component> content, String style) {
    this(id, columns, gap, content, null, null, null, style);
  }

  public ResponsiveGrid(
      String id,
      List<GridTrack> columns,
      String gap,
      List<Component> content,
      List<Integer> colSpans,
      String style) {
    this(id, columns, gap, content, colSpans, null, null, style);
  }

  public ResponsiveGrid(
      String id,
      List<GridTrack> columns,
      String gap,
      List<Component> content,
      List<Integer> colSpans,
      String stackBelow,
      String style) {
    this(id, columns, gap, content, colSpans, stackBelow, null, style);
  }

  /**
   * A named-slot template (coherence-plan #7): a grid with {@code grid-template-areas} and children
   * placed by their {@code slot} into the matching area. Columns default to the areas' implied
   * tracks unless given.
   */
  public static ResponsiveGrid template(String id, String areas, List<Component> slotted) {
    return new ResponsiveGrid(id, null, null, slotted, null, null, areas, null);
  }

  /**
   * The CSS {@code grid-template-columns} value resolved from the tracks (e.g. "auto 1fr 15rem").
   */
  public String gridTemplateColumns() {
    if (columns == null || columns.isEmpty()) {
      return null;
    }
    return columns.stream().map(GridTrack::toCss).reduce((a, b) -> a + " " + b).orElse(null);
  }
}
