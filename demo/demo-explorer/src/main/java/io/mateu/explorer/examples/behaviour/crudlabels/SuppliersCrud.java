package io.mateu.explorer.examples.behaviour.crudlabels;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.NotDeletable;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.IntStream;

/**
 * The built-in buttons are labelled by overridable methods ({@code newLabel()}, {@code
 * saveLabel()}, {@code cancelLabel()}, {@code editLabel()}…), and a capability the crud must not
 * offer is subtracted with an {@code @Not*} annotation: {@code @NotDeletable} removes Delete — the
 * button AND the server-side action.
 */
@Title("Suppliers")
@NotDeletable
public class SuppliersCrud extends AutoCrud<SuppliersCrud.Supplier> {

  public static class Supplier implements Identifiable {
    public String id;
    public String name;
    public String country;

    public Supplier() {}

    Supplier(String id, String name, String country) {
      this.id = id;
      this.name = name;
      this.country = country;
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

  static final String[] COUNTRIES = {"Spain", "Portugal", "France", "Italy"};

  static final List<Supplier> SUPPLIERS =
      new CopyOnWriteArrayList<>(
          IntStream.range(0, 50)
              .mapToObj(i -> new Supplier("SUP-" + (10 + i), "Supplier " + (10 + i), COUNTRIES[i % 4]))
              .toList());

  @Override
  public String newLabel() {
    return "Add supplier";
  }

  @Override
  public String editLabel() {
    return "Change";
  }

  @Override
  public String saveLabel() {
    return "Save supplier";
  }

  @Override
  public String cancelLabel() {
    return "Discard";
  }

  @Override
  public CrudStore<Supplier> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Supplier> findById(String id) {
        return SUPPLIERS.stream().filter(s -> s.id.equals(id)).findFirst();
      }

      @Override
      public String save(Supplier supplier) {
        if (supplier.id == null || supplier.id.isBlank()) {
          supplier.id = "SUP-" + (10 + SUPPLIERS.size());
          SUPPLIERS.add(supplier);
        } else {
          SUPPLIERS.replaceAll(s -> s.id.equals(supplier.id) ? supplier : s);
        }
        return supplier.id;
      }

      @Override
      public List<Supplier> findAll() {
        return List.copyOf(SUPPLIERS);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        SUPPLIERS.removeIf(s -> ids.contains(s.id));
      }
    };
  }
}
