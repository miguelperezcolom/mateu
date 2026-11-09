package io.mateu.explorer.examples.behaviour.pagewidth;

import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Title;

/** FULL_WIDTH: 24px margins (growing up to 96px on wide screens); the content takes the rest. */
@Title("Full width")
@PageWidth(PageWidthStyle.FULL_WIDTH)
public class FullWidthPage {

  @Notice(fullWidth = true)
  String band = "This band spans the page's content width — resize the window to see the margins.";

  String name = "Ada Lovelace";
}
