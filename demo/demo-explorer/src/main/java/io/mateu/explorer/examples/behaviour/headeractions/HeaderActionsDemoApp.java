package io.mateu.explorer.examples.behaviour.headeractions;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Buttons on the APP header, next to the context pickers: the app class implements {@link
 * AppActionsSupplier}. An action with children is a dropdown — only its children dispatch. They are
 * evaluated per request, so the server decides who sees them; each runs the app method of its id.
 */
@UI("/apps/header-actions")
@Title("Header actions demo")
@App
public class HeaderActionsDemoApp implements AppActionsSupplier {

  @Menu Welcome welcome;

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(
        new AppHeaderAction("syncNow", "Sync", "vaadin:refresh"),
        AppHeaderAction.menu(
            "Export",
            "vaadin:download",
            List.of(
                new AppHeaderAction("exportPdf", "As PDF"),
                new AppHeaderAction("exportCsv", "As CSV"))));
  }

  public Message syncNow() {
    return Message.success("Synced with the server");
  }

  public Message exportPdf() {
    return new Message("Exported as PDF");
  }

  public Message exportCsv() {
    return new Message("Exported as CSV");
  }

  /** The app's only screen. */
  @Title("Header actions")
  @io.mateu.uidl.annotations.ReadOnly
  public static class Welcome {
    String hint = "Use Sync and the Export menu on the app header above.";
  }
}
