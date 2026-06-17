package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.AutoCrudAdapter;
import io.mateu.core.infra.declarative.AutoCrud;
import io.mateu.uidl.annotations.UI;
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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
class Item implements Identifiable {

    @NotEmpty
    String id;

    @NotEmpty
    String name;

    double price;

    @Override
    public String id() {
        return id;
    }

    @Override
    public String toString() {
        return name != null ? "Item " + name : "New item";
    }
}

class ItemRepository implements CrudRepository<Item> {

    private static final Map<String, Item> db = new HashMap<>(Map.of(
            "1", new Item("1", "Widget A", 9.99),
            "2", new Item("2", "Widget B", 19.99)
    ));

    @Override
    public Optional<Item> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Item entity) {
        db.put(entity.getId(), entity);
        return entity.getId();
    }

    @Override
    public List<Item> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}

class ItemAdapter extends AutoCrudAdapter<Item> {

    @Override
    public CrudRepository<Item> repository() {
        return new ItemRepository();
    }
}

@UI("/items")
public class ItemsCatalog extends AutoCrud<Item> {

    @Override
    public AutoCrudAdapter<Item> simpleAdapter() {
        return new ItemAdapter();
    }
}
