package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Full page width — the slab is fluid and uncapped, with fixed 24px side gutters. */
@UI("/width-full")
@Title("Full width")
@PageWidth(PageWidthStyle.FULL_WIDTH)
public class WidthFull extends WidthDemoBase {
  @Override
  String heading() {
    return "Full width — fluid, 24px side gutters";
  }

  @Override
  String body() {
    return """
        This page uses **`@PageWidth(FULL_WIDTH)`**.

        The content slab is **fluid and uncapped** — it grows with the viewport, keeping a constant
        24px gutter on each side. Good for dense, data-heavy screens (grids, dashboards).
        """;
  }
}
