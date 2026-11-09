package io.mateu.explorer.examples.behaviour.dialogs;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;

/**
 * Three ways to ask the user something:
 *
 * <ul>
 *   <li>return a {@link Dialog} from an action — any content, in a modal;
 *   <li>{@code @Action(confirmationRequired = true)} — the framework asks before running the method;
 *   <li>return a {@link ConfirmDialog} — confirm / reject / cancel, each wired to an action.
 * </ul>
 */
@Title("Ask the user")
public class DialogsDemo {

  @PlainText String lastAnswer = "nothing yet";

  @Button
  Dialog openDialog() {
    return Dialog.builder()
        .headerTitle("Opening hours")
        .closeButtonOnHeader(true)
        .width("24rem")
        .content(new Text("Monday to Friday, 9:00 – 18:00. Closed on public holidays."))
        .build();
  }

  @Button
  @Action(
      confirmationRequired = true,
      confirmationTitle = "Empty the trash",
      confirmationMessage = "Everything in the trash is deleted for good.",
      confirmationText = "Empty it",
      confirmationDenialText = "Keep it")
  Message emptyTrash() {
    return Message.success("The trash is empty");
  }

  @Button
  ConfirmDialog publish() {
    return ConfirmDialog.builder()
        .header("Publish the article?")
        .content(new Text("Publish now, or keep it as a draft."))
        .canCancel(true)
        .canReject(true)
        .confirmText("Publish")
        .rejectText("Keep as draft")
        .confirmActionId("published")
        .rejectActionId("keptAsDraft")
        .build();
  }

  @Action
  State published() {
    lastAnswer = "published";
    return new State(this);
  }

  @Action
  State keptAsDraft() {
    lastAnswer = "kept as draft";
    return new State(this);
  }
}
