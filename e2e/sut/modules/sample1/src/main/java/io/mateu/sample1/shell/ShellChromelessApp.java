package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A chromeless shell: no navigation chrome, only the command-center FAB. */
@UI("/shell-cc")
@Title("Shell chromeless")
@App(chromeless = true)
public class ShellChromelessApp implements GlobalSearchSupplier {

  @Menu Section1 page;

  @Menu ShellReports reports;

  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase();
    return List.of(new GlobalSearchResult("Ada Lovelace", "Customer 1", "/shell-cc/page", "Customers"))
        .stream()
        .filter(r -> (r.label() + " " + r.description()).toLowerCase().contains(text))
        .toList();
  }
}
