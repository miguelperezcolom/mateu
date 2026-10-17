package io.mateu.sample1.app.drawerconstraints;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * The create/edit drawer checks every constraint the browser can — a required field, a bound, a
 * pattern — before Save leaves, on every renderer: nothing is sent while one fails, and the field
 * is marked with the constraint's message.
 */
@UI("/drawer-constraints")
@Title("Drawer constraints")
public class DrawerConstraintsCrud extends AutoCrud<DrawerConstraintsCrud.Room> {

  public static class Room implements Identifiable {
    public String id;
    @NotEmpty public String name;

    @Min(1)
    @Max(9)
    public Integer beds;

    @Pattern(regexp = "^[A-Z]{3}$")
    public String code;

    public Room() {}

    Room(String id, String name, Integer beds, String code) {
      this.id = id;
      this.name = name;
      this.beds = beds;
      this.code = code;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Room> ROOMS = new ArrayList<>(List.of(new Room("r1", "Attic", 2, "ATT")));

  /** How many saves reached the store: a refused one in the browser never gets here. */
  public static int saves;

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudStore<Room> store() {
    return new CrudStore<>() {
      @Override
      public synchronized Optional<Room> findById(String id) {
        return ROOMS.stream().filter(r -> r.id.equals(id)).findFirst();
      }

      @Override
      public synchronized String save(Room entity) {
        saves++;
        if (entity.id == null || entity.id.isBlank()) {
          entity.id = "r" + (ROOMS.size() + 1);
          ROOMS.add(entity);
        } else {
          ROOMS.replaceAll(r -> r.id.equals(entity.id) ? entity : r);
        }
        return entity.id;
      }

      @Override
      public synchronized List<Room> findAll() {
        return List.copyOf(ROOMS);
      }

      @Override
      public synchronized void deleteAllById(List<String> ids) {
        ROOMS.removeIf(r -> ids.contains(r.id));
      }
    };
  }
}
