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
    String style)
    implements Component {

  public ResponsiveGrid(String id, List<GridTrack> columns, List<Component> content) {
    this(id, columns, null, content, null, null);
  }

  public ResponsiveGrid(
      String id, List<GridTrack> columns, String gap, List<Component> content, String style) {
    this(id, columns, gap, content, null, style);
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
