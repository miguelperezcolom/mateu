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

@UI("/catalog-hidden-cols")
public class CatalogWithHiddenColumns extends AutoCrud<CatalogWithHiddenColumns.Order> {

    @Override
    public CrudRepository<Order> store() {
        return new OrderRepository();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Order implements Identifiable {
        @NotEmpty
        String id;

        @NotEmpty
        String customerName;

        @HiddenInList
        String internalNotes;

        double amount;

        @HiddenInCreate
        String createdBy = "system";

        @HiddenInEditor
        String externalRef;

        @Override
        public String id() { return id; }

        @Override
        public String toString() { return "Order " + id; }
    }

    static class OrderRepository implements CrudRepository<Order> {
        private static final Map<String, Order> db = new HashMap<>(Map.of(
                "o1", new Order("o1", "Alice", "Note A", 100.0, "admin", "EXT-001"),
                "o2", new Order("o2", "Bob", "Note B", 200.0, "admin", "EXT-002")
        ));

        @Override
        public Optional<Order> findById(String id) { return Optional.ofNullable(db.get(id)); }

        @Override
        public String save(Order entity) { db.put(entity.getId(), entity); return entity.getId(); }

        @Override
        public List<Order> findAll() { return db.values().stream().toList(); }

        @Override
        public void deleteAllById(List<String> ids) { ids.forEach(db::remove); }
    }
}
