package io.mateu.explorer.examples.behaviour.commands;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import java.net.URI;
import java.util.List;

/**
 * An action can return COMMANDS — instructions for the browser — next to (or instead of) new
 * state:
 *
 * <ul>
 *   <li>a {@link URI} or {@link UICommand#navigateTo} — go to another route (a URI outside the app
 *       is a browser load);
 *   <li>{@code SetWindowTitle} — rename the browser tab;
 *   <li>{@link UICommand#announce} / {@link UICommand#announceAssertive} — say something to screen
 *       readers only (a live region; nothing visible).
 * </ul>
 */
@Title("Commands")
public class CommandsPanel {

  String windowTitle = "Renamed by an action";

  @Button
  @Label("Return a URI")
  URI goToValidation() {
    return URI.create("/behaviour/forms/validation");
  }

  @Button
  @Label("navigateTo")
  UICommand navigate() {
    return UICommand.navigateTo("/behaviour/forms/rules");
  }

  @Button
  @Label("Set window title")
  UICommand rename() {
    return new UICommand(UICommandType.SetWindowTitle, windowTitle);
  }

  @Button
  @Label("Announce")
  List<UICommand> announce() {
    return List.of(
        UICommand.announce("Three new arrivals"),
        UICommand.announceAssertive("Room 214 is not ready"));
  }
}
