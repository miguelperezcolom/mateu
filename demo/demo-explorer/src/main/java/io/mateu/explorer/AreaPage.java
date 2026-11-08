package io.mateu.explorer;

import io.mateu.explorer.catalog.ExplorerCatalog;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;

/**
 * The index of one area ({@code /<area>/overview}, the area pinned by {@link ExplorerRoutes}): its groups,
 * the entries of each, and the checklist ids still waiting for one.
 */
public class AreaPage implements ComponentTreeSupplier {

  String area;

  public static String routeOf(String area) {
    return area + "/overview";
  }

  @Override
  public String style() {
    return "max-width: 1100px; margin: auto;";
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var catalog = ExplorerCatalog.get();
    var found = catalog.area(area).orElse(null);
    if (found == null) {
      return Form.builder().title("No such area").build();
    }
    var coveredBy = new HashMap<String, String>();
    catalog.entries().forEach(e -> e.covers().forEach(id -> coveredBy.putIfAbsent(id, e.route())));
    var md = new StringBuilder();
    for (var group : found.groups()) {
      md.append("### ").append(group.title()).append("\n\n");
      for (var e : catalog.entriesOf(found.id(), group.id())) {
        md.append("- [**").append(e.title()).append("**](/").append(e.route()).append(")\n");
      }
      var pending =
          group.items().stream().filter(i -> !coveredBy.containsKey(i.id())).map(i -> i.title()).toList();
      if (!pending.isEmpty()) {
        md.append("\n*Coming:* ").append(String.join(" · ", pending)).append("\n");
      }
      md.append("\n");
    }
    return Form.builder()
        .title(found.title())
        .overline("Mateu Explorer")
        .contentItem(new Markdown(md.toString(), null, null))
        .build();
  }
}
