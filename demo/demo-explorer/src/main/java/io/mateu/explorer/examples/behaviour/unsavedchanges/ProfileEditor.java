package io.mateu.explorer.examples.behaviour.unsavedchanges;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import java.util.List;

/**
 * {@code @ConfirmOnNavigationIfDirty}: once a field is edited, leaving the page — a menu click,
 * browser back, reload, closing the tab — asks first. A successful save returns {@link
 * UICommand#markAsClean()}, so leaving afterwards does not ask; {@link UICommand#markAsDirty()}
 * does the opposite from any action.
 */
@Title("Profile")
@ConfirmOnNavigationIfDirty
public class ProfileEditor {

  String name = "Ada Lovelace";

  String email = "ada@example.com";

  @Button
  Object save() {
    return List.of(Message.success("Saved " + name), UICommand.markAsClean());
  }

  @Button
  UICommand markDirty() {
    return UICommand.markAsDirty();
  }
}
