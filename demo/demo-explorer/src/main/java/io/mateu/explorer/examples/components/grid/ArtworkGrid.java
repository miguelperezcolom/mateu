package io.mateu.explorer.examples.components.grid;

import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Two fluent grids: a compact one whose first column is clickable (its {@code actionId} runs with the
 * clicked row's values as parameters), and a TREE grid — rows carrying a {@code children} list.
 */
public class ArtworkGrid implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    List<Map<String, Object>> works =
        List.of(
            Map.of("id", "1", "title", "Sunflowers", "year", 1888, "room", "Room 12"),
            Map.of("id", "2", "title", "The Bedroom", "year", 1889, "room", "Room 12"),
            Map.of("id", "3", "title", "Wheatfield with Crows", "year", 1890, "room", "Room 14"));
    List<Map<String, Object>> tree =
        List.of(
            Map.of(
                "name", "Paintings",
                "count", 412,
                "children",
                    List.of(
                        Map.of("name", "Impressionism", "count", 88),
                        Map.of("name", "Baroque", "count", 61))),
            Map.of(
                "name", "Sculpture",
                "count", 138,
                "children", List.of(Map.of("name", "Bronze", "count", 54))));
    return VerticalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .content(
            List.of(
                Grid.builder()
                    .compact(true)
                    .content(
                        List.of(
                            GridColumn.builder().id("title").label("Title").actionId("openWork").build(),
                            GridColumn.builder().id("year").label("Year").align(io.mateu.uidl.data.ColumnAlignment.end).build(),
                            GridColumn.builder().id("room").label("Room").build()))
                    .page(new Page<>("", works.size(), 0, works.size(), works))
                    .build(),
                new Text("A tree grid:", TextContainer.h4),
                Grid.builder()
                    .tree(true)
                    .content(
                        List.of(
                            GridColumn.builder().id("name").label("Department").build(),
                            GridColumn.builder().id("count").label("Works").build()))
                    .page(new Page<>("", tree.size(), 0, tree.size(), tree))
                    .build()))
        .build();
  }

  public Message openWork(HttpRequest httpRequest) {
    // the clicked row's values arrive as the action's parameters
    var row = httpRequest.runActionRq().parameters();
    return new Message("Opening " + row.get("title") + " (" + row.get("year") + "), " + row.get("room"));
  }
}
