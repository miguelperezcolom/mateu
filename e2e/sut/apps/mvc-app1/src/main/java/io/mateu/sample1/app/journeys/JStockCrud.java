package io.mateu.sample1.app.journeys;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Inline editing on a CRUD listing (tests/journeys/crud.spec.ts): every data column of the table is
 * an editor and each committed cell saves its row at once ({@code update-row}); {@code @ReadOnly}
 * stays display-only.
 */
@UI("/j/stock")
@Title("Journey stock")
@InlineEditing
public class JStockCrud extends AutoCrud<JStockCrud.StockItem> {

  public static class StockItem implements Identifiable {
    @ReadOnly public String id;
    @ReadOnly public String name;
    public int quantity;

    public StockItem() {}

    StockItem(String id, String name, int quantity) {
      this.id = id;
      this.name = name;
      this.quantity = quantity;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<StockItem> ITEMS = new java.util.concurrent.CopyOnWriteArrayList<>();

  static {
    reset();
  }

  static void reset() {
    ITEMS.clear();
    ITEMS.add(new StockItem("S-1", "Bolts", 10));
    ITEMS.add(new StockItem("S-2", "Nuts", 20));
    ITEMS.add(new StockItem("S-3", "Washers", 30));
  }

  @Override
  public CrudStore<StockItem> store() {
    return new CrudStore<>() {
      @Override
      public Optional<StockItem> findById(String id) {
        return ITEMS.stream().filter(i -> i.id.equals(id)).findFirst();
      }

      @Override
      public String save(StockItem entity) {
        ITEMS.replaceAll(i -> i.id.equals(entity.id) ? entity : i);
        return entity.id;
      }

      @Override
      public List<StockItem> findAll() {
        return new ArrayList<>(ITEMS);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ITEMS.removeIf(i -> ids.contains(i.id));
      }
    };
  }
}
