package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@UI("/products")
public class Products extends AutoCrud<Products.Product> {

    @Override
    public CrudRepository<Product> repository() {
        return new ProductRepository();
    }

    enum ProductStatus {
        Available, OutOfStock
    }

    record Product(
            @NotEmpty @EditableOnlyWhenCreating String id,
            @NotEmpty String name,
            @Stereotype(FieldStereotype.textarea)
            @HiddenInList String description,
            @NotNull
            @Status(
                    defaultStatus = StatusType.NONE,
                    mappings = {
                            @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                            @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
                    }
            )
            ProductStatus status
    ) implements Identifiable {

        @Override
        public String toString() {
            return name != null ? "Product " + name : "New product";
        }
    }

    static class ProductRepository implements CrudRepository<Product> {

        private static final Map<String, Product> db = new LinkedHashMap<>(Map.of(
                "p1", new Product("p1", "Laptop Pro 15", "High-performance laptop for professionals.", ProductStatus.Available),
                "p2", new Product("p2", "Wireless Keyboard", "Ergonomic wireless keyboard with long battery life.", ProductStatus.Available),
                "p3", new Product("p3", "USB-C Hub", "7-in-1 USB-C hub with HDMI, SD and USB ports.", ProductStatus.OutOfStock)
        ));

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
}
