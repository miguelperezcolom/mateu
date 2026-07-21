package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Edge-to-edge page width — the content touches the content-area edges (no gutters). */
@UI("/width-edge")
@Title("Edge to edge")
@PageWidth(PageWidthStyle.EDGE_TO_EDGE)
public class WidthEdge extends WidthDemoBase {
  @Override
  String heading() {
    return "Edge to edge — content touches the edges";
  }

  @Override
  String body() {
    return """
        This page uses **`@PageWidth(EDGE_TO_EDGE)`**.

        The content spans the full content area with **no side gutters** — for canvases that need
        every pixel: gantt/planning boards, maps, full-bleed foldouts.
        """;
  }
}
