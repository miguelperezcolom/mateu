package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.AutoCrudAdapter;
import io.mateu.core.infra.declarative.orchestrators.crudorchestrator.AutoCrudOrchestrator;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

enum ProductStatus {
    Available, OutOfStock
}

@Slf4j
record Product(
        @NotEmpty @EditableOnlyWhenCreating String id,
               @NotEmpty
               String name,
               @Stereotype(FieldStereotype.textarea)
               @HiddenInList
               String description,
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
        ColumnActionGroup action,
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

    private static final Map<String, Product> db = new HashMap<>(Map.of("1", new Product("1", "Producto 1", "xxx", true, ProductStatus.Available, null, List.of(
            new ProductComponent("x", 1, null, false, "yyy"),
            new ProductComponent("y", 2, null, true, "xxx")
    ))));

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

class ProductAdapter extends AutoCrudAdapter<Product> {

    @Override
    public CrudRepository<Product> repository() {
        return new ProductRepository();
    }
}

@UI("/products")
@Slf4j
public class Products extends AutoCrudOrchestrator<Product> {

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return new ProductAdapter();
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
