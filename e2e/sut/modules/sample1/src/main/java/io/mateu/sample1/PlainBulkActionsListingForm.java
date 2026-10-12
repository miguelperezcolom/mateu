package io.mateu.sample1;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import java.util.stream.IntStream;

/**
 * The same bulk button as {@link BulkActionsListingForm}, on a listing that declares NO interaction
 * capability — so it is never promoted to the CRUD mediator, and its toolbar renders in the PAGE
 * header (mateu-content-header), not in the crud. The selection guard has to hold there too.
 */
@UI("/bulk-actions-plain")
@Title("Plain bulk actions")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class PlainBulkActionsListingForm implements Listing<PlainBulkActionsListingForm.Row> {

  public record Row(String id, String name, String status) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var rows =
        IntStream.rangeClosed(1, 5)
            .mapToObj(i -> new Row("J-%03d".formatted(i), "Job " + i, "failed"))
            .toList();
    return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
  }

  @Override
  public boolean selectionEnabled() {
    return true;
  }

  @ListToolbarButton
  @Action(confirmationTitle = "Archive jobs")
  @Label("Archive")
  public Message archive(List<Row> selection) {
    return new Message(selection.size() + " archived");
  }
}
