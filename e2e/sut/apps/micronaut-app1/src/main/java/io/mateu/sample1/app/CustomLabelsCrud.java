package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@UI("/custom-labels-crud")
public class CustomLabelsCrud extends AutoCrud<CustomLabelsCrud.Item> {

    @Override
    public String newLabel() {
        return "Añadir";
    }

    @Override
    public String saveLabel() {
        return "Guardar cambios";
    }

    @Override
    public String cancelLabel() {
        return "Descartar";
    }

    @Override
    public String deleteLabel() {
        return "Eliminar";
    }

    @Override
    public String editLabel() {
        return "Editar";
    }

    @Override
    public String backToListLabel() {
        return "Volver al listado";
    }

    @Override
    public CrudRepository<Item> repository() {
        return new ItemRepo();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item implements Identifiable {
        String id;

        @NotEmpty
        String name;

        @Override
        public String id() {
            return id;
        }

        @Override
        public String toString() {
            return name != null ? name : "Item";
        }
    }

    static class ItemRepo implements CrudRepository<Item> {
        private static final Map<String, Item> db =
                new HashMap<>(Map.of("1", new Item("1", "Alpha"), "2", new Item("2", "Beta")));

        @Override
        public Optional<Item> findById(String id) {
            return Optional.ofNullable(db.get(id));
        }

        @Override
        public String save(Item entity) {
            db.put(entity.getId(), entity);
            return entity.getId();
        }

        @Override
        public List<Item> findAll() {
            return new ArrayList<>(db.values());
        }

        @Override
        public void deleteAllById(List<String> ids) {
            ids.forEach(db::remove);
        }
    }
}
