package io.mateu.sample1;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import java.util.stream.IntStream;

/**
 * Bulk buttons on a listing toolbar, declared by the three annotations that each own one job:
 * {@code @ListToolbarButton} the placement, {@code @Toolbar} the look, {@code @Action} the
 * behaviour.
 *
 * <p>A bulk action runs over N rows at once, so it is the one that most needs to look dangerous
 * and to say what the user is confirming — {@code retry} is the button as it could only be written
 * before (generic dialog, default look), {@code cancel} the same button saying both.
 */
@UI("/bulk-actions")
@Title("Bulk actions")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class BulkActionsListingForm
    implements Listing<BulkActionsListingForm.Row>, Deletable<String> {

  public record Row(String id, String name, String status) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var rows =
        IntStream.rangeClosed(1, 5)
            .mapToObj(i -> new Row("P-%03d".formatted(i), "Process " + i, "failed"))
            .toList();
    return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
  }

  @Override
  public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}

  @ListToolbarButton(confirmationRequired = true)
  @Label("Retry from failure")
  public Message retryFromFailure(List<Row> selection) {
    return new Message(selection.size() + " retried");
  }

  @ListToolbarButton(confirmationRequired = true)
  @Toolbar(buttonStyle = ButtonStyle.secondary, buttonColor = ButtonColor.error, order = 10)
  @Action(
      confirmationTitle = "Cancel processes",
      confirmationMessage = "Cancelling stops every selected process. This cannot be undone.",
      confirmationText = "Cancel them",
      confirmationDenialText = "Keep running")
  @Label("Cancel")
  public Message cancel(List<Row> selection) {
    return new Message(selection.size() + " cancelled");
  }
}
