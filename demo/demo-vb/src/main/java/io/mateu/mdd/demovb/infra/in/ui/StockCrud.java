package io.mateu.mdd.demovb.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Crud con edición inline ({@code @InlineEditing}): las columnas viajan con {@code editable} en el
 * wire — en el renderer VB eso activa el formato {@code display="grid"} compacto de oj-table (tabla
 * de TRABAJO), frente al {@code list} aireado de los listados de consulta.
 */
@UI("/stock")
@Title("Stock")
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
  public GridLayout gridLayout() {
    return GridLayout.table;
  }

  @Override
  public CrudStore<StockItem> store() {
    return new CrudStore<>() {

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
