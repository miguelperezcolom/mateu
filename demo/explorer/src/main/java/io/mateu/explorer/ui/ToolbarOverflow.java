package io.mateu.explorer.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;

/**
 * Several secondary toolbar buttons — they must stay inline while they FIT the header and only the
 * trailing ones that don't fit collapse into the "…" menu (not all of them, and not at a fixed count).
 * Resize the window to see the overflow adapt.
 */
@UI("/toolbar-overflow")
@Title("Toolbar overflow")
public class ToolbarOverflow {

    String name = "Order 4711";

    @Toolbar public void refresh() {}
    @Toolbar public void duplicate() {}
    @Toolbar public void export() {}
    @Toolbar public void archive() {}
    @Toolbar public void share() {}
    @Toolbar public void print() {}
    @Toolbar public void settings() {}
}
