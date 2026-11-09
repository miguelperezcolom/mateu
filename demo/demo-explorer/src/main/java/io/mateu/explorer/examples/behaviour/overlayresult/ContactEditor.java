package io.mateu.explorer.examples.behaviour.overlayresult;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * The drawer's content — a server-side component of its own. "Save" closes the drawer WITH a
 * result; "Check duplicates" opens a dialog OVER the drawer: overlays stack, and closing the dialog
 * leaves the drawer (and what was typed in it) where it was.
 */
public class ContactEditor implements ComponentTreeSupplier {

  String name = "";

  @Override
  public Component component(HttpRequest httpRequest) {
    return new VerticalLayout(
        FormField.builder().id("name").label("Name").dataType(FieldDataType.string).build(),
        HorizontalLayout.builder()
            .spacing(true)
            .content(
                List.of(
                    Button.builder()
                        .label("Save")
                        .actionId("saveContact")
                        .buttonStyle(ButtonStyle.primary)
                        .callable(() -> UICommand.closeModal("contact-saved", Map.of("name", name)))
                        .build(),
                    Button.builder()
                        .label("Check duplicates")
                        .actionId("checkDuplicates")
                        .callable(
                            () ->
                                Dialog.builder()
                                    .headerTitle("Possible duplicates")
                                    .closeButtonOnHeader(true)
                                    .content(new DuplicatesDialog())
                                    .build())
                        .build()))
            .build());
  }

  /** The nested dialog: its Close unwinds only the topmost overlay — itself. */
  public static class DuplicatesDialog implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          new Text("No contact with that name — it is safe to save."),
          Button.builder()
              .label("Close")
              .actionId("closeDuplicates")
              .callable(UICommand::closeModal)
              .build());
    }
  }
}
