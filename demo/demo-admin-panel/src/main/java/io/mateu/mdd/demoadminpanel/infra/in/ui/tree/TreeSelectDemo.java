package io.mateu.mdd.demoadminpanel.infra.in.ui.tree;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.TreeSelect;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.List;

/**
 * Demo of {@code @TreeSelect}: the field's dropdown unfolds a TREE instead of a flat option list.
 * The hierarchy comes from the options carrying children (here via {@code OptionsSupplier}); with
 * {@code leavesOnly=true} intermediate nodes only expand/collapse.
 */
@UI("/tree-select")
@Title("Tree select")
public class TreeSelectDemo implements OptionsSupplier {

  @TreeSelect
  @Label("Zona (cualquier nodo)")
  String zona;

  @TreeSelect(leavesOnly = true)
  @Label("Zona (solo hojas)")
  String zonaHoja;

  // the SELECTOR variant: the lookup dialog opens a TREE listing (ZoneSelector, GridLayout.tree)
  @io.mateu.uidl.annotations.Searchable(selector = ZoneSelector.class, label = ZoneSelector.class)
  @Label("Zona (selector en diálogo)")
  String zonaLookup;

  @Override
  public List<Option> options(String fieldName, HttpRequest httpRequest) {
    return List.of(
        new Option(
            "espana",
            "España",
            List.of(
                new Option(
                    "baleares",
                    "Baleares",
                    List.of(new Option("mallorca", "Mallorca"), new Option("menorca", "Menorca"))),
                new Option(
                    "canarias",
                    "Canarias",
                    List.of(
                        new Option("tenerife", "Tenerife"),
                        new Option("granCanaria", "Gran Canaria"))))),
        new Option(
            "portugal",
            "Portugal",
            List.of(new Option("algarve", "Algarve"), new Option("madeira", "Madeira"))));
  }

  @Toolbar
  Object save(HttpRequest httpRequest) {
    return Message.success("Zona: " + zona + " · Zona hoja: " + zonaHoja + " · Zona lookup: " + zonaLookup);
  }
}
