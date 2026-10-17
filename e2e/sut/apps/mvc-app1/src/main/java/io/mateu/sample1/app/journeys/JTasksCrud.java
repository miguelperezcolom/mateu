package io.mateu.sample1.app.journeys;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.data.CrudDisplay;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * The CRUD journey in a drawer (tests/journeys/crud.spec.ts): New and row clicks open the form in a
 * drawer over the listing, "Save and next" walks the rows without closing it, and {@code @Version}
 * turns a save over someone else's save into the conflict dialog.
 */
@UI("/j/tasks")
@Title("Journey tasks")
public class JTasksCrud extends AutoCrud<JTasksCrud.Task> {

  public static class Task implements Identifiable {
    public String id;
    @NotEmpty public String title;
    public int hours;
    @Version public long version;

    public Task() {}

    Task(String id, String title, int hours) {
      this.id = id;
      this.title = title;
      this.hours = hours;
      this.version = 1;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return title;
    }
  }

  static final List<Task> TASKS = new java.util.concurrent.CopyOnWriteArrayList<>();

  static {
    reset();
  }

  static void reset() {
    synchronized (TASKS) {
      TASKS.clear();
      TASKS.add(new Task("T-01", "Plan the release", 3));
      TASKS.add(new Task("T-02", "Write the notes", 2));
      TASKS.add(new Task("T-03", "Tag the build", 1));
    }
  }

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudDisplay display() {
    return CrudDisplay.defaults().toBuilder().saveAndNext(Toggle.on).build();
  }

  @Override
  public CrudStore<Task> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Task> findById(String id) {
        return TASKS.stream().filter(t -> t.id.equals(id)).findFirst();
      }

      @Override
      public String save(Task entity) {
        if (entity.id == null || entity.id.isBlank()) {
          entity.id =
              "T-"
                  + String.format(
                      "%02d",
                      TASKS.stream()
                              .map(t -> Integer.parseInt(t.id.substring(2)))
                              .max(Comparator.naturalOrder())
                              .orElse(0)
                          + 1);
          TASKS.add(entity);
        } else {
          TASKS.replaceAll(t -> t.id.equals(entity.id) ? entity : t);
        }
        return entity.id;
      }

      @Override
      public List<Task> findAll() {
        return new ArrayList<>(TASKS);
      }

      @Override
      public void deleteAllById(List<String> ids) {
        TASKS.removeIf(t -> ids.contains(t.id));
      }
    };
  }
}
