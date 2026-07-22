package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.interfaces.Submenu;

/** A submenu group (Page widths). */
public class WidthsMenu implements Submenu {
  @Menu WidthFixed widthFixed;
  @Menu WidthFull widthFull;
  @Menu WidthEdge widthEdge;
}
