package io.mateu.explorer;

import io.mateu.explorer.catalog.ExplorerCatalog;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashSet;

/** The Explorer's home: what it is, and how much of Mateu each area already shows. */
public class HomePage implements ComponentTreeSupplier {

  @Override
  public String style() {
    return "max-width: 1100px; margin: auto;";
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var catalog = ExplorerCatalog.get();
    var covered = new HashSet<String>();
    catalog.entries().forEach(e -> covered.addAll(e.covers()));
    var md = new StringBuilder();
    md.append(
        """
        Everything Mateu can do — every component, page template, archetype, behaviour and \
        distributed-UI pattern — **running live**, next to the very source that renders it.

        This app is itself a Mateu app. Each entry page draws its examples from YAML files and Java \
        classes of this module, and its *Code* tabs show those same files, read back from the jar: \
        what you read is what runs.

        Press **⌘K / Ctrl+K** to search the entries.

        | Area | Entries | Checklist covered |
        |---|---:|---:|
        """);
    for (var area : catalog.areas()) {
      int total = 0;
      int done = 0;
      for (var g : area.groups()) {
        for (var item : g.items()) {
          total++;
          if (covered.contains(item.id())) {
            done++;
          }
        }
      }
      long entries = catalog.entries().stream().filter(e -> e.area().equals(area.id())).count();
      md.append("| [")
          .append(area.title())
          .append("](/")
          .append(AreaPage.routeOf(area.id()))
          .append(") | ")
          .append(entries)
          .append(" | ")
          .append(done)
          .append(" / ")
          .append(total)
          .append(" |\n");
    }
    return Form.builder()
        .title("Mateu Explorer")
        .subtitle("Model-driven UIs — every piece, live, with its code")
        .contentItem(new Markdown(md.toString(), null, null))
        .build();
  }
}
