package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import java.util.stream.IntStream;

/**
 * A plain listing, in the framework-agnostic module so every adapter serves it.
 *
 * <p>Its reason to exist is the SHAPE of a listing screen rather than any of its behaviour: a table
 * with a pager under it, which is what the layout has to get right — the table filling the window
 * instead of stopping at the height a grid defaults to, and the pager staying on screen instead of
 * being pushed past the fold by a full page of rows.
 */
@UI("/simple-listing")
@Title("Simple listing")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class SimpleListingForm implements Listing<SimpleListingForm.Row> {

  public record Row(String code, String name, int units) {}

  @Override
  public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
    var rows =
        IntStream.rangeClosed(1, 25)
            .mapToObj(i -> new Row("C-%03d".formatted(i), "Item " + i, i * 3))
            .toList();
    return new ListingData<>(new Page<>("", rows.size(), 0, rows.size(), rows));
  }
}
