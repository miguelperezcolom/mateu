package io.mateu.explorer.examples.behaviour.pagewidth;

import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Title;

/**
 * EDGE_TO_EDGE: no margins at all — for boards, maps, planners. A FORM page never bleeds (it gets
 * full width instead), so this one declares itself a DETAIL page.
 */
@Title("Edge to edge")
@PageTemplate(PageType.DETAIL)
@PageWidth(PageWidthStyle.EDGE_TO_EDGE)
public class EdgeToEdgePage {

  @Notice(fullWidth = true)
  String band = "This band spans the page's content width — resize the window to see the margins.";

  String name = "Ada Lovelace";
}
