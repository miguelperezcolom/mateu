package io.mateu.explorer.examples.components.virtuallist;

import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VirtualList;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * A virtual list renders only the rows in view, so a long list stays fast. Each row is any
 * component you build; give the list a fixed height in its style so it can scroll.
 */
public class AccessionLog implements ComponentTreeSupplier {

  static final String[] KINDS = {"Painting", "Drawing", "Print", "Photograph", "Sculpture"};

  @Override
  public Component component(HttpRequest httpRequest) {
    var rows = new ArrayList<Component>();
    for (int i = 1; i <= 2000; i++) {
      rows.add(
          HorizontalLayout.builder()
              .spacing(true)
              .content(
                  List.of(
                      new Text("ACC-" + (2026_00000 + i)),
                      new Text(KINDS[i % KINDS.length] + " #" + i),
                      new Badge(i % 7 == 0 ? "on loan" : "in store")))
              .build());
    }
    return VirtualList.builder()
        .page(new Page<>("", rows.size(), 0, rows.size(), rows))
        .style("height: 18rem;")
        .build();
  }
}
