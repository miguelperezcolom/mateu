package io.mateu.explorer.examples.behaviour.pagewidth;

import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.PageWidth;
import io.mateu.uidl.annotations.PageWidthStyle;
import io.mateu.uidl.annotations.Title;

/** FIXED: the content grows up to 1392px, then stays centred. */
@Title("Fixed width")
@PageWidth(PageWidthStyle.FIXED)
public class FixedWidthPage {

  @Notice(fullWidth = true)
  String band = "This band spans the page's content width — resize the window to see the margins.";

  String name = "Ada Lovelace";
}
