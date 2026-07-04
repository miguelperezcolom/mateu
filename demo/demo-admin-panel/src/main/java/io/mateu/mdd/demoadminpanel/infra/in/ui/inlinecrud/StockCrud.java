package io.mateu.mdd.demoadminpanel.infra.in.ui.inlinecrud;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Demo of inline row editing on a CRUD listing: the class-level {@link InlineEditing} makes every
 * cell editable in place; each committed cell persists its row through the repository (update-row
 * action) — no detail form round-trip.
 */
@UI("/inline-crud-demo")
@Title("Stock (edit in place)")
@InlineEditing
public class StockCrud extends AutoCrud<StockCrud.StockItem> {

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StockItem implements Identifiable {
    @ReadOnly String id;
    String product;
    int units;
    double price;
    boolean active;

    @Override
    public String id() {
      return id;
    }
  }

  private static final List<StockItem> ITEMS =
      new ArrayList<>(
          List.of(
              new StockItem("1", "Widget", 120, 9.90, true),
              new StockItem("2", "Gadget", 43, 19.50, true),
              new StockItem("3", "Gizmo", 0, 4.25, false)));

  @Override
  public io.mateu.uidl.fluent.GridLayout gridLayout() {
    return io.mateu.uidl.fluent.GridLayout.table;
  }

  @Override
  public CrudRepository<StockItem> repository() {
    return new CrudRepository<>() {

      @Override
      public Optional<StockItem> findById(String id) {
        return ITEMS.stream().filter(item -> item.id().equals(id)).findFirst();
      }

      @Override
      public String save(StockItem entity) {
        if (entity.getId() == null || entity.getId().isBlank()) {
          entity.setId(UUID.randomUUID().toString());
          ITEMS.add(entity);
        } else {
          ITEMS.replaceAll(item -> item.id().equals(entity.id()) ? entity : item);
        }
        return entity.getId();
      }

      @Override
      public List<StockItem> findAll() {
        return ITEMS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        ITEMS.removeIf(item -> selectedIds.contains(item.id()));
      }
    };
  }
}
