package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@UI("/full-crud")
public class FullCrud extends AutoCrud<FullCrud.Task> {

    @Override
    public CrudRepository<Task> repository() {
        return new TaskRepository();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Task implements Identifiable {
        String id;

        @NotEmpty
        String title;

        @Stereotype(io.mateu.uidl.data.FieldStereotype.textarea)
        String description;

        @Min(1)
        int priority = 1;

        boolean done;

        @Override
        public String id() { return id; }

        @Override
        public String toString() { return title != null ? title : "New Task"; }
    }

    static class TaskRepository implements CrudRepository<Task> {
        private static final Map<String, Task> db = new LinkedHashMap<>(Map.of(
                "t1", new Task("t1", "Task Alpha", "First task", 1, false),
                "t2", new Task("t2", "Task Beta", "Second task", 2, true),
                "t3", new Task("t3", "Task Gamma", "Third task", 3, false)
        ));

        @Override
        public Optional<Task> findById(String id) { return Optional.ofNullable(db.get(id)); }

        @Override
        public String save(Task entity) {
            if (entity.getId() == null || entity.getId().isBlank()) {
                entity.setId(UUID.randomUUID().toString());
            }
            db.put(entity.getId(), entity);
            return entity.getId();
        }

        @Override
        public List<Task> findAll() { return new ArrayList<>(db.values()); }

        @Override
        public void deleteAllById(List<String> ids) { ids.forEach(db::remove); }
    }
}
