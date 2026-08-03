package io.mateu.sample1;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;

/**
 * Fixture for the overlay accessibility guarantees: a modal must OWN the focus while it is open.
 *
 * A drawer or dialog that does not trap the focus is a modal only for people using a mouse — with
 * the keyboard, Tab walks through the page behind the scrim, reaching controls the user cannot
 * see, while the panel they just opened stays unreachable. Closing it then drops the focus
 * wherever it drifted to, so the place they were working is lost.
 *
 * Both overlays carry a couple of focusable controls so a test can Tab around and assert the
 * focus never leaves the panel, and that it returns to the button that opened it.
 */
@UI("/overlays")
@Title("Overlays")
public class OverlayForm {

  String reference = "REF-001";

  @Button
  @Label("Open drawer")
  Drawer openDrawer() {
    return Drawer.builder()
        .id("a11y-drawer")
        .headerTitle("Drawer panel")
        .position(DrawerPosition.end)
        .width("28rem")
        .content(new OverlayContentForm())
        .build();
  }

  @Button
  @Label("Open dialog")
  Dialog openDialog() {
    return Dialog.builder()
        .id("a11y-dialog")
        .headerTitle("Dialog panel")
        .closeButtonOnHeader(true)
        .content(new OverlayContentForm())
        .build();
  }
}
