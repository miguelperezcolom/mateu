package io.mateu.demo.localtool;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import jakarta.inject.Inject;

/**
 * The tool's app shell: one menu entry per thing the tool does, and a Quit button on the header
 * (an ordinary {@link AppActionsSupplier} action) that stops the service.
 */
@UI("")
@Title("Local tool")
public class Shell implements AppActionsSupplier {

  @Menu LargestFiles largestFiles;

  @Menu
  @Label("CSV to JSON")
  CsvToJson csvToJson;

  @Inject Quit quit;

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(new AppHeaderAction("quit", "Quit", "vaadin:power-off"));
  }

  /** The header's Quit button: answer the goodbye, then stop (off this thread, a moment later). */
  public Dialog quit() {
    quit.soon();
    return Dialog.builder()
        .headerTitle("Local tool stopped")
        .content(
            new VerticalLayout(
                new Text("bye", "The tool has stopped. You can close this tab.", TextContainer.p),
                new Text(
                    "again", "Run the command again to start it once more.", TextContainer.p)))
        .build();
  }
}
