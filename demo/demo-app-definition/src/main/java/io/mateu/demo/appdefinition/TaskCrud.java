package io.mateu.demo.appdefinition;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * A CRUD MEDIATOR bound to a route by DATA — there is no {@code @UI} here; {@code routes.yaml} maps
 * {@code tasks} to this class as its {@code viewModel}. It demonstrates that a route-bound class view
 * (a mediator) renders INSIDE the data-driven app shell: a fresh {@code /tasks} paints the shell, and
 * the content load resolves this CRUD inside it. (A CRUD could also be expressed as routes+views,
 * skipping the mediator — the route registry generalises what the mediator does.)
 */
public class TaskCrud extends AutoCrud<TaskCrud.Task> {

  @Override
  public CrudStore<Task> store() {
    return new Repo();
  }

  public static class Task implements Identifiable {
    private String id;
    private String title;
    private boolean done;

    public Task() {}

    public Task(String id, String title, boolean done) {
      this.id = id;
      this.title = title;
      this.done = done;
    }

    @Override
    public String id() {
      return id;
    }

    public String getId() {
      return id;
    }

    public void setId(String id) {
      this.id = id;
    }

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public boolean isDone() {
      return done;
    }

    public void setDone(boolean done) {
      this.done = done;
    }

    @Override
    public String toString() {
      return title != null ? title : "New task";
    }
  }

  static class Repo implements CrudStore<Task> {
    private static final Map<String, Task> db =
        new LinkedHashMap<>(
            Map.of(
                "t1", new Task("t1", "A CRUD mediator, bound by routes.yaml", true),
                "t2", new Task("t2", "Rendered inside the data-driven app shell", false)));

    @Override
    public Optional<Task> findById(String id) {
      return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Task entity) {
      if (entity.getId() == null || entity.getId().isBlank()) {
        entity.setId(UUID.randomUUID().toString());
      }
      db.put(entity.getId(), entity);
      return entity.getId();
    }

    @Override
    public List<Task> findAll() {
      return new ArrayList<>(db.values());
    }

    @Override
    public void deleteAllById(List<String> ids) {
      ids.forEach(db::remove);
    }
  }
}
