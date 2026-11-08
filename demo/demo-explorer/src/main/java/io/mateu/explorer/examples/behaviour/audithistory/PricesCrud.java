package io.mateu.explorer.examples.behaviour.audithistory;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.IntStream;

/**
 * {@code Auditable} on the crud adds a History button. {@code history} returns one {@link
 * AuditEntry} per changed FIELD, the changes of one save sharing their {@code when} — so the dialog
 * groups them into versions (old → new per field). Recording the trail is the app's: here the store
 * compares the saved product with the stored one.
 */
@Title("Price list")
public class PricesCrud extends AutoCrud<PricesCrud.Product> implements Auditable {

  public static class Product implements Identifiable {
    public String id;
    public String name;
    public Double price;
    public Integer stock;

    public Product() {}

    Product(String id, String name, Double price, Integer stock) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.stock = stock;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " " + name;
    }
  }

  static final List<Product> PRODUCTS =
      new CopyOnWriteArrayList<>(
          IntStream.range(0, 50)
              .mapToObj(i -> new Product("P-" + (1 + i), "Product " + (1 + i), 5.0 + (i * 7) % 60, (i * 11) % 30))
              .toList());

  static final List<AuditEntry> TRAIL = new CopyOnWriteArrayList<>();

  static {
    var when = LocalDateTime.of(2026, 11, 2, 10, 30);
    TRAIL.add(new AuditEntry(when, "ada", "update", "P-1 price", "4.5", "5.0"));
    TRAIL.add(new AuditEntry(when, "ada", "update", "P-1 stock", "3", "0"));
  }

  @Override
  public ListingData<AuditEntry> history(
      String searchText, AuditFilters filters, Pageable pageable, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase();
    return ListingData.from(
        TRAIL.stream().filter(e -> (e.field() + " " + e.who()).toLowerCase().contains(text)).toList());
  }

  @Override
  public CrudStore<Product> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Product> findById(String id) {
        return PRODUCTS.stream().filter(p -> p.id.equals(id)).findFirst();
      }

      @Override
      public String save(Product product) {
        findById(product.id).ifPresent(before -> record(before, product));
        PRODUCTS.replaceAll(p -> p.id.equals(product.id) ? product : p);
        return product.id;
      }

      @Override
      public List<Product> findAll() {
        return List.copyOf(PRODUCTS);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        PRODUCTS.removeIf(p -> ids.contains(p.id));
      }
    };
  }

  /** One entry per changed field, all with the same timestamp: one version. */
  static void record(Product before, Product after) {
    var when = LocalDateTime.now().withNano(0);
    var changes = new ArrayList<AuditEntry>();
    compare(changes, when, after.id + " name", before.name, after.name);
    compare(changes, when, after.id + " price", before.price, after.price);
    compare(changes, when, after.id + " stock", before.stock, after.stock);
    TRAIL.addAll(0, changes);
  }

  static void compare(List<AuditEntry> into, LocalDateTime when, String field, Object old, Object now) {
    if (!Objects.equals(old, now)) {
      into.add(new AuditEntry(when, "you", "update", field, String.valueOf(old), String.valueOf(now)));
    }
  }
}
