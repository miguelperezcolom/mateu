package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.NoticeDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CrudDisplay;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@code Crud.display()} (the Redwood collection-container / create-edit-drawer displayOptions):
 * New/Delete on|off|disabled, the edit drawer's "Save and next" (spPrimaryActionAndNext) and the
 * drawer error banner (displayErrorMessageBanner).
 */
@SuppressWarnings("unchecked")
class CrudDisplaySyncTest {

  public static class Room implements Identifiable {
    String id;
    String name;

    public Room() {}

    Room(String id, String name) {
      this.id = id;
      this.name = name;
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

  static final List<Room> ROOMS = new ArrayList<>();

  static CrudStore<Room> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Room> findById(String id) {
        return ROOMS.stream().filter(r -> r.id.equals(id)).findFirst();
      }

      @Override
      public String save(Room entity) {
        if (entity.name != null && entity.name.contains("boom")) {
          throw new IllegalStateException("Room names cannot explode");
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

  @UI("/rooms-drawer")
  @Title("Rooms")
  public static class RoomsCrud extends AutoCrud<Room> {
    @Override
    public boolean editInDrawer() {
      return true;
    }

    @Override
    public CrudDisplay display() {
      return CrudDisplay.defaults().toBuilder().saveAndNext(Toggle.on).build();
    }

    @Override
    public CrudStore<Room> store() {
      return CrudDisplaySyncTest.store();
    }
  }

  @UI("/rooms-locked")
  @Title("Rooms (locked)")
  public static class LockedRoomsCrud extends AutoCrud<Room> {
    @Override
    public CrudDisplay display() {
      return CrudDisplay.defaults().toBuilder().create(Toggle.disabled).delete(Toggle.off).build();
    }

    @Override
    public CrudStore<Room> store() {
      return CrudDisplaySyncTest.store();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RoomsCrud.class, LockedRoomsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    ROOMS.clear();
    ROOMS.add(new Room("r1", "Ocean view"));
    ROOMS.add(new Room("r2", "Garden"));
    ROOMS.add(new Room("r3", "Attic"));
  }

  private UIIncrementDto run(String route, Class<?> type, String actionId, Map<String, Object> s) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(type.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(s)
            .build());
  }

  @Test
  void createDisabledAndDeleteOffShapeTheListingToolbar() {
    var increment = run("/rooms-locked", LockedRoomsCrud.class, "", Map.of());
    var buttons = WireWalk.all(increment, ButtonDto.class);
    assertThat(buttons)
        .anySatisfy(
            b -> {
              assertThat(b.actionId()).isEqualTo("new");
              assertThat(b.disabled()).isTrue();
            });
    assertThat(buttons).noneMatch(b -> "delete".equals(b.actionId()));
  }

  @Test
  void theEditDrawerOffersSaveAndNext() {
    var increment = run("/rooms-drawer", RoomsCrud.class, "edit", Map.of("id", "r1"));
    var drawer = WireWalk.first(increment, DrawerDto.class);
    assertThat(drawer).isNotNull();
    assertThat(WireWalk.all(drawer, ButtonDto.class))
        .anySatisfy(
            b -> {
              assertThat(b.actionId()).isEqualTo("save-and-next");
              assertThat(b.label()).isEqualTo("Save and next");
            });
  }

  @Test
  void saveAndNextSavesAndReSendsTheDrawerForTheNextRow() {
    var increment =
        run("/rooms-drawer", RoomsCrud.class, "save-and-next", Map.of("id", "r1", "name", "Sea"));
    assertThat(ROOMS.get(0).name).isEqualTo("Sea");
    var drawer = WireWalk.first(increment, DrawerDto.class);
    assertThat(drawer).isNotNull();
    assertThat(drawer.initialData()).isInstanceOf(Map.class);
    assertThat((Map<Object, Object>) drawer.initialData()).containsEntry("id", "r2");
    // the drawer stays (no close) and the listing refreshes through the saved event
    assertThat(increment.commands()).noneMatch(c -> c.type() == UICommandTypeDto.CloseModal);
    assertThat(increment.commands()).anyMatch(c -> c.type() == UICommandTypeDto.DispatchEvent);
  }

  @Test
  void saveAndNextOnTheLastRowClosesTheDrawer() {
    var increment =
        run("/rooms-drawer", RoomsCrud.class, "save-and-next", Map.of("id", "r3", "name", "Loft"));
    assertThat(WireWalk.first(increment, DrawerDto.class)).isNull();
    assertThat(increment.commands()).anyMatch(c -> c.type() == UICommandTypeDto.CloseModal);
  }

  @Test
  void aFailedSaveInTheDrawerShowsAnErrorBannerKeepingWhatWasTyped() {
    var increment =
        run("/rooms-drawer", RoomsCrud.class, "save", Map.of("id", "r2", "name", "boom room"));
    var drawer = WireWalk.first(increment, DrawerDto.class);
    assertThat(drawer).isNotNull();
    var notice = WireWalk.first(drawer, NoticeDto.class);
    assertThat(notice).isNotNull();
    assertThat(notice.text()).isEqualTo("Room names cannot explode");
    assertThat(notice.theme()).isEqualTo("danger");
    assertThat((Map<Object, Object>) drawer.initialData()).containsEntry("name", "boom room");
    // and it is announced, since nothing takes focus
    assertThat(increment.commands()).anyMatch(c -> c.type() == UICommandTypeDto.Announce);
  }
}
