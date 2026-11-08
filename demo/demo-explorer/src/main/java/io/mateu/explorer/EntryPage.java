package io.mateu.explorer;

import io.mateu.explorer.catalog.Entry;
import io.mateu.explorer.catalog.ExplorerCatalog;
import io.mateu.explorer.catalog.UidlCatalog;
import io.mateu.uidl.Templates;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.HorizontalAlignment;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * The page of one entry, at {@code /<area>/<group>/<entry>} (the entry id is pinned by {@link
 * ExplorerRoutes}): what it is, the examples RUNNING, the source behind them and where to read
 * more. Built from the entry's file — there is nothing entry-specific in this class.
 */
public class EntryPage implements ComponentTreeSupplier {

  /** Pinned per route by {@link ExplorerRoutes} (fixedParams). */
  String entry;

  @Override
  public String style() {
    return "max-width: 1200px; margin: auto;";
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var catalog = ExplorerCatalog.get();
    var found = catalog.entry(entry).orElse(null);
    if (found == null) {
      return Form.builder()
          .title("No such entry")
          .contentItem(new Text("There is no Explorer entry called '" + entry + "'."))
          .build();
    }
    var content = new ArrayList<Component>();
    content.add(new Markdown(describe(found, catalog), null, null));
    var docs = docLinks(found, catalog);
    if (!docs.isEmpty()) {
      content.add(row(docs));
    }
    if (found.notDemonstrable() != null) {
      content.add(
          Notice.builder()
              .theme("info")
              .text(literal("Not demonstrable live: " + found.notDemonstrable()))
              .build());
    }
    for (var example : found.examples()) {
      content.add(exampleCard(example));
    }
    var code = codeTabs(found);
    if (code != null) {
      content.add(new Text("Code", TextContainer.h3));
      content.add(code);
    }
    var area = catalog.area(found.area()).map(ExplorerCatalog.Area::title).orElse(found.area());
    return Form.builder()
        .title(literal(found.title()))
        .overline(literal(area))
        .subtitle(literal(String.join(" · ", found.covers())))
        .content(content)
        .build();
  }

  private static String describe(Entry entry, ExplorerCatalog catalog) {
    if (entry.description() != null && !entry.description().isBlank()) {
      return entry.description();
    }
    var lines = new ArrayList<String>();
    var descriptions = UidlCatalog.descriptions();
    for (var id : entry.covers()) {
      if (id.startsWith("component:")) {
        var type = id.substring("component:".length());
        var d = descriptions.get(type);
        if (d != null) {
          lines.add("**" + type + "** — " + d);
        }
      } else {
        var item = catalog.items().get(id);
        if (item != null) {
          lines.add(item.title());
        }
      }
    }
    return String.join("\n\n", lines);
  }

  private static List<Component> docLinks(Entry entry, ExplorerCatalog catalog) {
    var urls = new java.util.LinkedHashSet<String>();
    if (entry.doc() != null) {
      urls.add(entry.doc());
    }
    for (var id : entry.covers()) {
      var item = catalog.items().get(id);
      if (item != null && item.doc() != null) {
        urls.add(item.doc());
      }
    }
    var links = new ArrayList<Component>();
    for (var url : urls) {
      links.add(new Anchor("📖 " + url.replaceFirst("^https://mateu\\.io", "mateu.io"), url, "_blank", null, null));
    }
    return links;
  }

  private static Component exampleCard(Entry.Example example) {
    var body = new ArrayList<Component>();
    if (example.description() != null) {
      body.add(new Markdown(example.description(), null, null));
    }
    body.add(live(example));
    return Card.builder()
        .title(new Text(example.title() == null ? "Live example" : literal(example.title())))
        .content(column(body))
        .variants(List.of(io.mateu.uidl.data.CardVariant.outlined))
        .style("width: 100%;")
        .build();
  }

  /** The example itself, running. */
  static Component live(Entry.Example example) {
    if (example.yaml() != null) {
      return new Partial(example.yaml());
    }
    if (example.java() != null) {
      if ("inline".equals(example.embed())) {
        return new Partial(example.java());
      }
      try {
        var view = Class.forName(example.java()).getDeclaredConstructor().newInstance();
        return new EmbeddedView(view);
      } catch (ReflectiveOperationException e) {
        return Notice.builder().theme("danger").text("Cannot build " + example.java() + ": " + e).build();
      }
    }
    if (example.route() != null) {
      return column(
          List.of(
              new Anchor("Open this page on its own ↗", "/" + example.route(), "_blank", null, null),
              MicroFrontend.builder()
                  .route("/" + example.route())
                  .style("display: block; width: 100%; min-height: 24rem;")
                  .build()));
    }
    return new Text("(this example declares nothing to run)");
  }

  /** One tab per source file: the file's text as the build copied it into the jar. */
  private static Component codeTabs(Entry entry) {
    var files = entry.code();
    if (files.isEmpty()) {
      return null;
    }
    var tabs = new ArrayList<Tab>();
    for (var file : files) {
      var text =
          ExplorerCatalog.source(file.path())
              .orElse("// " + file.path() + " was not found in the jar (explorer-src/).");
      tabs.add(new Tab(literal(label(file)), new Markdown(fenced(file.language(), file.path(), text), null, null)));
    }
    return TabLayout.builder().tabs(tabs).style("width: 100%;").build();
  }

  private static String label(Entry.CodeFile file) {
    if (file.label() != null) {
      return file.label();
    }
    var name = file.path().substring(file.path().lastIndexOf('/') + 1);
    var lang =
        switch (file.language()) {
          case "yaml" -> "YAML";
          case "java" -> "Java";
          case "csharp" -> "C#";
          case "python" -> "Python";
          default -> file.language();
        };
    return lang + " · " + name;
  }

  static String fenced(String language, String path, String text) {
    var fence = "```";
    while (text.contains(fence)) {
      fence += "`";
    }
    return "`" + path + "`\n\n" + fence + language + "\n" + text.stripTrailing() + "\n" + fence + "\n";
  }

  /**
   * An entry's own text (title, a card title, a tab label, a notice) shown AS WRITTEN. Those
   * components are templates — the client evaluates a {@code ${…}} in them against the state, so a
   * title that talks ABOUT interpolation ("A `${…}` in a label…") painted "… is not defined".
   * {@link Templates#literal} writes the client's escape (a backslash before the dollar sign). Markdown is NOT a template
   * on the client (it is shown verbatim, the escape would show), so descriptions and code stay raw.
   */
  static String literal(String text) {
    return Templates.literal(text);
  }

  static Component column(List<Component> items) {
    return VerticalLayout.builder()
        .content(items)
        .spacing(true)
        .fullWidth(true)
        .horizontalAlignment(HorizontalAlignment.STRETCH)
        .build();
  }

  static Component row(List<Component> items) {
    return io.mateu.uidl.data.HorizontalLayout.builder().content(items).spacing(true).wrap(true).build();
  }
}
