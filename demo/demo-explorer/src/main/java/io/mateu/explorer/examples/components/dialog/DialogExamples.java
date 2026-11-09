package io.mateu.explorer.examples.components.dialog;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Overlays are RETURNED from an action: the button runs a method, the method returns a {@link
 * Dialog} or a {@link ConfirmDialog}, and it opens over the page. A dialog's own buttons are
 * ordinary actions of this view; {@code UICommand.closeModal()} closes the topmost overlay.
 */
public class DialogExamples implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .wrap(true)
        .content(
            List.of(
                button("Open a dialog", "openDialog"),
                button("Open a modeless, draggable dialog", "openModeless"),
                button("Delete the record…", "askToDelete")))
        .build();
  }

  static Button button(String label, String actionId) {
    return Button.builder().label(label).actionId(actionId).build();
  }

  /** A modal dialog with a header, content and a footer of buttons. */
  public Dialog openDialog() {
    return Dialog.builder()
        .headerTitle("The Starry Night")
        .width("28rem")
        .content(
            VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("Vincent van Gogh, June 1889. Oil on canvas, 73.7 × 92.1 cm."),
                        new Text("On view at MoMA, New York — gallery 501.")))
                .build())
        .footer(
            HorizontalLayout.builder()
                .content(
                    List.of(
                        button("Close", "closeDialog"),
                        Button.builder()
                            .label("Request a loan")
                            .actionId("requestLoan")
                            .buttonStyle(ButtonStyle.primary)
                            .build()))
                .build())
        .build();
  }

  /** No backdrop: the page stays usable behind it, and the header drags it around. */
  public Dialog openModeless() {
    return Dialog.builder()
        .headerTitle("Notes")
        .modeless(true)
        .draggable(true)
        .resizable(true)
        .closeButtonOnHeader(true)
        .top("8rem")
        .left("4rem")
        .width("22rem")
        .content(new Text("Drag me by the header; the page behind keeps working."))
        .build();
  }

  public List<Object> closeDialog() {
    return List.of(UICommand.closeModal());
  }

  public List<Object> requestLoan() {
    return List.of(UICommand.closeModal(), Message.success("Loan request sent to MoMA"));
  }

  /** A ConfirmDialog: the picked button's action runs on this view. */
  public ConfirmDialog askToDelete() {
    return ConfirmDialog.builder()
        .header("Delete this record?")
        .content(new Text("The catalogue entry and its 12 photographs will be removed."))
        .confirmText("Delete")
        .confirmActionId("doDelete")
        .canReject(true)
        .rejectText("Archive instead")
        .rejectActionId("doArchive")
        .canCancel(true)
        .build();
  }

  public Message doDelete() {
    return Message.success("Deleted");
  }

  public Message doArchive() {
    return new Message("Archived instead");
  }
}
