package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Fixed page width — the content slab is capped at 1408px and centered on the canvas. */
@UI("/width-fixed")
@Title("Fixed width")
@PageWidth(PageWidthStyle.FIXED)
public class WidthFixed extends WidthDemoBase {
  @Override
  String heading() {
    return "Fixed width — capped at 1408px, centered";
  }

  @Override
  String body() {
    return """
        This page uses **`@PageWidth(FIXED)`**.

        The content slab is capped at **1408px** and centered, so the page canvas shows at the
        sides on wide screens. This is the Redwood default for most detail and form pages.
        """;
  }
}
