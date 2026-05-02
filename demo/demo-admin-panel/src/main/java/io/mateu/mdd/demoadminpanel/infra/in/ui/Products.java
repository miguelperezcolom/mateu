package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

enum ProductStatus {
    Available, OutOfStock
}

record Product(
        @NotEmpty @EditableOnlyWhenCreating String id,
               @NotEmpty
               String name,
               @Stereotype(FieldStereotype.textarea)
               @HiddenInList
               String description,
               @NotNull
               @Status(
                       defaultStatus = StatusType.NONE,
                       mappings = {
                               @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                               @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
                       }
               )
               ProductStatus status,
        ColumnActionGroup action) implements Identifiable {

    Product {
        action = new ColumnActionGroup(new ColumnAction[]{
                        new ColumnAction("action-on-row-setAsBlue", "Set as blue"),
                        new ColumnAction("action-on-row-setAsGreen", "Set as green")
                });
    }

    @Override
    public String toString() {
        return name != null?"Product " + name:"New product";
    }
}

class ProductRepository implements CrudRepository<Product> {

    private static final Map<String, Product> db = new HashMap<>(Map.of("1", new Product("1", "Producto 1", "xxx", ProductStatus.Available, null)));

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
public class Products extends AutoCrudOrchestrator<Product> {

    @Override
    public AutoCrudAdapter<Product> simpleAdapter() {
        return new ProductAdapter();
    }
}
