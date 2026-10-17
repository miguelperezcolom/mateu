package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridGroupColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/** A fluent grid with a column group: "Occupancy" spans the Adults and Children columns. */
@UI("/grouped-grid")
@Title("Grouped grid")
public class GroupedGridForm implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    var rows =
        List.<Object>of(
            Map.of("room", "101", "adults", 2, "children", 1),
            Map.of("room", "102", "adults", 1, "children", 0));
    return Grid.builder()
        .id("rooms")
        .content(
            List.of(
                column("room", "Room"),
                GridGroupColumn.builder()
                    .id("occupancy")
                    .label("Occupancy")
                    .columns(List.of(column("adults", "Adults"), column("children", "Children")))
                    .build()))
        .page(new Page<>("", rows.size(), 0, rows.size(), rows))
        .build();
  }

  private static GridColumn column(String id, String label) {
    return GridColumn.builder()
        .id(id)
        .label(label)
        .dataType(FieldDataType.string)
        .stereotype(FieldStereotype.regular)
        .build();
  }
}
