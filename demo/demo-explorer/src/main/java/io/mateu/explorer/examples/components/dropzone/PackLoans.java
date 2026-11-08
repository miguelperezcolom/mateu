package io.mateu.explorer.examples.components.dropzone;

import io.mateu.uidl.data.DropZone;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Drag rows to a destination. A listing with a {@code dragType} makes its rows draggable (the
 * selected ones, or the row under the pointer); a {@link DropZone} that {@code accept}s that type
 * runs its {@code actionId} with its {@code parameters} plus {@code _draggedIds}. On a declarative
 * listing class the same is {@code @DragRows("artwork")}.
 */
public class PackLoans implements ComponentTreeSupplier {

  /** crate → artwork ids packed in it: the view's state. */
  Map<String, List<String>> crates = Map.of("A", new ArrayList<>(), "B", new ArrayList<>());

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Listing.builder()
                    .title("Artworks")
                    .dragType("artwork")
                    .rowsSelectionEnabled(true)
                    .style("flex: 2;")
                    .rowsSource(RestDataSource.builder().url("/explorer-api/listing-artworks").build())
                    .column(GridColumn.builder().id("id").label("Id").build())
                    .column(GridColumn.builder().id("title").label("Title").build())
                    .build(),
                crate("A"),
                crate("B")))
        .build();
  }

  DropZone crate(String name) {
    var packed = crates.get(name);
    return DropZone.builder()
        .accept("artwork")
        .actionId("pack")
        .parameters(Map.of("crate", name))
        .title("Crate " + name)
        .subtitle(packed.isEmpty() ? "Drop artworks here" : packed.size() + " packed")
        .content(packed.isEmpty() ? List.of() : List.of(new Text(String.join(", ", packed))))
        .style("flex: 1;")
        .build();
  }

  @SuppressWarnings("unchecked")
  public Object pack(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    var crate = (String) p.get("crate");
    var ids = (List<String>) p.get("_draggedIds");
    var copy = new java.util.HashMap<String, List<String>>();
    crates.forEach((k, v) -> copy.put(k, new ArrayList<>(v)));
    copy.get(crate).addAll(ids);
    crates = copy;
    return List.of(this, Message.success(ids + " packed in crate " + crate));
  }
}
