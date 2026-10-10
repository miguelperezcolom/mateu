package io.mateu.sample1.app.patterns;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CrudDisplay;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Pattern gaps showcase: the create-edit drawer's "Save and next" and its error banner (a name
 * containing "boom" fails to save), plus CrudDisplay switching Delete off and New to disabled.
 */
@UI("/patterns/rooms")
@Title("Rooms")
public class RoomsCrud extends AutoCrud<RoomsCrud.Room> {

  public static class Room implements Identifiable {
    public String id;
    public String name;
    public int beds;

    public Room() {}

    Room(String id, String name, int beds) {
      this.id = id;
      this.name = name;
      this.beds = beds;
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

  static final List<Room> ROOMS =
      new ArrayList<>(
          List.of(
              new Room("101", "Ocean view", 2),
              new Room("102", "Garden", 3),
              new Room("103", "Attic", 1)));

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudDisplay display() {
    return CrudDisplay.defaults().toBuilder()
        .saveAndNext(Toggle.on)
        .create(Toggle.disabled)
        .delete(Toggle.off)
        .build();
  }

  @Override
  public CrudStore<Room> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Room> findById(String id) {
        return ROOMS.stream().filter(r -> r.id.equals(id)).findFirst();
      }

      @Override
      public String save(Room entity) {
        if (entity.name != null && entity.name.toLowerCase().contains("boom")) {
          throw new IllegalStateException("A room name cannot contain boom");
        }
        ROOMS.replaceAll(r -> r.id.equals(entity.id) ? entity : r);
        return entity.id;
      }

      @Override
      public List<Room> findAll() {
        return ROOMS;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ROOMS.removeIf(r -> ids.contains(r.id));
      }
    };
  }
}
