package io.mateu.explorer.examples.behaviour.shellvariants;

import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/** Explorer plumbing: one tab per variant, each the same small app framed (see {@link AppPreview}). */
public class ShellVariantsPreview implements ComponentTreeSupplier {

  static final List<String[]> VARIANTS =
      List.of(
          new String[] {"MENU_ON_TOP", "top"},
          new String[] {"MENU_ON_LEFT", "left"},
          new String[] {"HAMBURGER_MENU", "hamburger"},
          new String[] {"HAMBURGER_SECTIONS", "sections"},
          new String[] {"TILES", "tiles"},
          new String[] {"TABS", "tabs"},
          new String[] {"RAIL", "rail"});

  @Override
  public Component component(HttpRequest httpRequest) {
    var tabs = new ArrayList<Tab>();
    for (var v : VARIANTS) {
      tabs.add(new Tab(v[0], AppPreview.frame("/x/behaviour/shell-variants/" + v[1], "26rem")));
    }
    return TabLayout.builder().tabs(tabs).style("width: 100%;").build();
  }
}
