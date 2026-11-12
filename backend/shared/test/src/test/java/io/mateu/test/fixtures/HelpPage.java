package io.mateu.test.fixtures;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;

/** A page whose toolbar opens a drawer, and whose drawer closes itself. */
@UI("/help")
@Title("Help")
public class HelpPage {

  String topic = "Getting started";

  @Toolbar
  Drawer openHelp() {
    return Drawer.builder().headerTitle("Help").content(new Text("Read the docs")).build();
  }

  @Toolbar
  UICommand done() {
    return UICommand.closeModal();
  }
}
