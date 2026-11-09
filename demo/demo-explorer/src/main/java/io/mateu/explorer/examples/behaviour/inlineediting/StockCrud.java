package io.mateu.explorer.examples.behaviour.inlineediting;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.IntStream;

/**
 * {@code @InlineEditing} on the crud: every data column of the table edits in place, and each
 * committed cell saves its row at once ({@code CrudStore.save}). {@code @ReadOnly} columns stay
 * display-only.
 */
@Title("Stock")
@InlineEditing
public class StockCrud extends AutoCrud<StockCrud.Item> {

  public static class Item implements Identifiable {
    @ReadOnly public String sku;
    public String name;
    public Integer stock;
    public Double price;
    public Boolean active;

    public Item() {}

    Item(String sku, String name, Integer stock, Double price, Boolean active) {
      this.sku = sku;
      this.name = name;
      this.stock = stock;
      this.price = price;
      this.active = active;
    }

    @Override
    public String id() {
      return sku;
    }

    @Override
    public String toString() {
      return sku + " " + name;
    }
  }

  static final String[] NAMES = {"Pen", "Notebook", "Stapler", "Folder", "Marker", "Ruler", "Eraser"};

  static final List<Item> ITEMS =
      new CopyOnWriteArrayList<>(
          IntStream.range(0, 50)
              .mapToObj(
                  i ->
                      new Item(
                          "SKU-" + (500 + i),
                          NAMES[i % NAMES.length] + " " + (char) ('A' + i / NAMES.length),
                          (i * 17) % 120,
                          Math.round((1.5 + (i * 7) % 30 + 0.49) * 100) / 100.0,
                          i % 6 != 0))
              .toList());

  @Override
  public CrudStore<Item> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Item> findById(String id) {
        return ITEMS.stream().filter(i -> i.sku.equals(id)).findFirst();
      }

      @Override
      public String save(Item item) {
        ITEMS.replaceAll(i -> i.sku.equals(item.sku) ? item : i);
        return item.sku;
      }

      @Override
      public List<Item> findAll() {
        return List.copyOf(ITEMS);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ITEMS.removeIf(i -> ids.contains(i.sku));
      }
    };
  }
}
