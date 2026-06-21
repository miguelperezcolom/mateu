package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@UI("/catalog-read-only")
@NotCreatable
@NotEditable
@NotDeletable
public class CatalogNotCreatable extends AutoCrud<CatalogNotCreatable.Product> {

    @Override
    public CrudRepository<Product> repository() {
        return new ProductRepository();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Product implements Identifiable {
        @NotEmpty
        String id;
        @NotEmpty
        String name;
        double price;

        @Override
        public String id() { return id; }

        @Override
        public String toString() { return name; }
    }

    static class ProductRepository implements CrudRepository<Product> {
        private static final Map<String, Product> db = new HashMap<>(Map.of(
                "p1", new Product("p1", "Product A", 10.0),
                "p2", new Product("p2", "Product B", 20.0)
        ));

        @Override
        public Optional<Product> findById(String id) {
            return Optional.ofNullable(db.get(id));
        }

        @Override
        public String save(Product entity) {
            db.put(entity.getId(), entity);
            return entity.getId();
        }

        @Override
        public List<Product> findAll() {
            return db.values().stream().toList();
        }

        @Override
        public void deleteAllById(List<String> ids) {
            ids.forEach(db::remove);
        }
    }
}
