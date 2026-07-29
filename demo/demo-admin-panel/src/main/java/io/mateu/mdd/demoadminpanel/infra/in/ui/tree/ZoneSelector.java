package io.mateu.mdd.demoadminpanel.infra.in.ui.tree;

import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.Searchable;
import io.mateu.uidl.interfaces.SelectedItem;
import io.mateu.uidl.interfaces.Selector;
import java.util.List;

/**
 * A TREE-shaped selector: the lookup dialog shows the zones as a hierarchical grid
 * (GridLayout.tree — rows carry a self-referential children list) and clicking any node selects
 * it. Used by @Searchable(selector = ZoneSelector.class) fields.
 */
@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("min-width: 30rem;")
public class ZoneSelector
    implements Listing<ZoneSelector.ZoneRow>,
        Searchable,
        Filterable<ZoneSelector.Filters>,
        Selector<String>,
        LookupLabelSupplier {

  public record Filters() {}

  public record ZoneRow(String id, String name, List<ZoneRow> children) {}

  static final List<ZoneRow> ROOTS =
      List.of(
          new ZoneRow(
              "espana",
              "España",
              List.of(
                  new ZoneRow(
                      "baleares",
                      "Baleares",
                      List.of(
                          new ZoneRow("mallorca", "Mallorca", List.of()),
                          new ZoneRow("menorca", "Menorca", List.of()))),
                  new ZoneRow(
                      "canarias",
                      "Canarias",
                      List.of(new ZoneRow("tenerife", "Tenerife", List.of()))))),
          new ZoneRow(
              "portugal",
              "Portugal",
              List.of(new ZoneRow("algarve", "Algarve", List.of()))));

  @Override
  public GridLayout gridLayout() {
    return GridLayout.tree;
  }

  private String _fieldId;

  @Override
  public String fieldId() {
    return _fieldId;
  }

  @Override
  public Selector withFieldId(String fieldId) {
    _fieldId = fieldId;
    return this;
  }

  @Override
  public ListingData<ZoneRow> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.of(ROOTS.toArray(ZoneRow[]::new));
  }

  @Override
  public SelectedItem<String> selected(HttpRequest httpRequest) {
    ZoneRow row = httpRequest.getClickedRow(ZoneRow.class);
    return new SelectedItem<>(row.id(), row.name());
  }

  @Override
  public String label(String fieldName, Object id, HttpRequest httpRequest) {
    return findLabel(ROOTS, String.valueOf(id));
  }

  private static String findLabel(List<ZoneRow> rows, String id) {
    for (ZoneRow row : rows) {
      if (row.id().equals(id)) return row.name();
      var sub = findLabel(row.children(), id);
      if (sub != null) return sub;
    }
    return null;
  }
}
