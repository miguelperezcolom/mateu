package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

enum ProductStatus {
    Available, OutOfStock
}

@Slf4j
record Product(
        @Section(value = "Product information", columns = 4)
        @NotEmpty @EditableOnlyWhenCreating String id,
               @NotEmpty
               String name,
               boolean certified,
               @NotNull
               @Status(
                       defaultStatus = StatusType.NONE,
                       mappings = {
                               @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                               @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
                       }
               )
               ProductStatus status,
               LocalDate added,
               @io.mateu.uidl.annotations.RangeFilter
               double price,
        @Stereotype(FieldStereotype.textarea)
        @HiddenInList
        String description,
        ColumnActionGroup action,
        @Section("Components")
        @Label("")
        @Colspan(2)
        List<ProductComponent> components) implements Identifiable, LookupOptionsSupplier {

    Product {
        action = new ColumnActionGroup(new ColumnAction[]{
                        new ColumnAction("setAsBlue", "Set as blue"),
                        new ColumnAction("setAsGreen", "Set as green")
                });
    }

    @Toolbar
    public void doNothing() {
        log.info("do nothing");
        components.add(new ProductComponent("xx", 1, null, false, "yyy"));
    }

    @Override
    public String toString() {
        return name != null?"Product " + name:"New product";
    }

    @Override
    public ListingData<io.mateu.uidl.data.Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(new io.mateu.uidl.data.Option("zzz"));
    }
}

class ProductRepository implements CrudRepository<Product> {

    private static final Map<String, Product> db = createDb();

    private static Map<String, Product> createDb() {
        Map<String, Product> map = new HashMap<>();
        for (int i = 1; i <= 200; i++) {
            String id = String.format("%04d", i);
            map.put(id, new Product(id, "Producto " + i,
                    i % 2 == 0,
                    i % 3 == 0 ? ProductStatus.OutOfStock : ProductStatus.Available,
                    LocalDate.of(2026, 1, 1).plusDays(i),
                    i * 5.0,
                    "Descripción del producto " + i, null,
                    List.of(
                            new ProductComponent("x" + i, i, null, false, "yyy"),
                            new ProductComponent("y" + i, i + 1, null, true, "xxx")
                    )));
        }
        return map;
    }

    @Override
    public Optional<Product> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Product entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Product> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}


@UI("/products")
@Slf4j
public class Products extends AutoCrud<Product> {

    @Override
    public CrudRepository<Product> store() {
        return new ProductRepository();
    }

    void setAsBlue(Product row) {
      log.info("set as blue {}", row);
    }

    void setAsGreen(Product row) {
        log.info("set as green {}", row);
    }

    @ListToolbarButton
    void doSomethingOnRows(List<Product> selection) {
        log.info("do something on {}", selection);
    }

}
