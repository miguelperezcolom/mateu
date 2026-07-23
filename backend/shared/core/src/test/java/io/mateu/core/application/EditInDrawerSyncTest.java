package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@code Crud.editInDrawer()} (the Redwood "Create and Edit - Drawer" template): New and row clicks
 * open the crud form in a Drawer over the listing; saving persists, closes the drawer and lands
 * back on the listing; cancelling just closes the drawer.
 */
class EditInDrawerSyncTest {

  public static class Book implements Identifiable {
    String id;
    String title;
    int pages;

    public Book() {}

    public Book(String id, String title, int pages) {
      this.id = id;
      this.title = title;
      this.pages = pages;
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

  static final List<Book> BOOKS = new ArrayList<>();

  @UI("/drawer-books")
  @Title("Books")
  public static class BooksCrud extends AutoCrud<Book> {
    @Override
    public boolean editInDrawer() {
      return true;
    }

    @Override
    public CrudRepository<Book> store() {
      return new CrudRepository<>() {
        @Override
        public Optional<Book> findById(String id) {
          return BOOKS.stream().filter(book -> book.id().equals(id)).findFirst();
        }

        @Override
        public String save(Book entity) {
          if (entity.id == null || entity.id.isBlank()) {
            entity.id = UUID.randomUUID().toString();
            BOOKS.add(entity);
          } else if (findById(entity.id).isPresent()) {
            BOOKS.replaceAll(book -> book.id().equals(entity.id()) ? entity : book);
          } else {
            BOOKS.add(entity);
          }
          return entity.id;
        }

        @Override
        public List<Book> findAll() {
          return BOOKS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          BOOKS.removeIf(book -> selectedIds.contains(book.id()));
        }
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BooksCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void resetData() {
    BOOKS.clear();
    BOOKS.add(new Book("b1", "El Quijote", 863));
    BOOKS.add(new Book("b2", "Rayuela", 600));
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/drawer-books")
            .consumedRoute("/drawer-books")
            .serverSideType(BooksCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static DrawerDto drawerOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var drawer = FullSyncPipelineTest.findMetadata(fragment.component(), DrawerDto.class);
      if (drawer != null) {
        return drawer;
      }
    }
    return null;
  }

  private static boolean hasCommand(UIIncrementDto increment, UICommandTypeDto type) {
    return increment.commands().stream().anyMatch(command -> command.type() == type);
  }

  @Test
  void newOpensTheCreationFormInADrawerOverTheListing() {
    var increment = run("new", Map.of(), null);
    var drawer = drawerOf(increment);
    assertThat(drawer).isNotNull();
    // no navigation happened: the listing stays mounted underneath
    assertThat(hasCommand(increment, UICommandTypeDto.PushStateToHistory)).isFalse();
  }

  @Test
  void rowClickOpensTheEditDrawerInsteadOfTheViewPage() {
    var increment = run("view", Map.of("id", "b1"), null);
    var drawer = drawerOf(increment);
    assertThat(drawer).isNotNull();
  }

  @Test
  void createPersistsAndClosesTheDrawerEmittingTheSavedEvent() {
    var increment = run("create", Map.of("title", "Nuevo libro", "pages", 123), null);
    assertThat(BOOKS).hasSize(3);
    assertThat(BOOKS.stream().anyMatch(book -> "Nuevo libro".equals(book.title))).isTrue();
    // no re-render in this response — the listing refreshes itself via the saved event the
    // closing drawer emits (see the subscription test below)
    assertThat(hasCommand(increment, UICommandTypeDto.CloseModal)).isTrue();
    assertThat(hasCommand(increment, UICommandTypeDto.MarkAsClean)).isTrue();
  }

  @Test
  void theListingSubscribesToTheSavedEventToRefreshInPlace() {
    var increment = run("", Map.of(), null);
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnCustomEventTriggerDto.class);
              var onEvent = (io.mateu.dtos.OnCustomEventTriggerDto) trigger;
              assertThat(onEvent.eventName())
                  .isEqualTo(
                      io.mateu.core.infra.declarative.orchestrators.crud.Crud
                          .SAVED_IN_DRAWER_EVENT);
              assertThat(onEvent.actionId()).isEqualTo("search");
            });
  }

  @Test
  void saveOfAnEditedRowPersistsAndClosesTheDrawer() {
    var increment =
        run("save", Map.of("id", "b1", "title", "El Quijote (anotado)", "pages", 900), null);
    assertThat(BOOKS.stream().filter(book -> "b1".equals(book.id)).findFirst().orElseThrow().title)
        .isEqualTo("El Quijote (anotado)");
    assertThat(hasCommand(increment, UICommandTypeDto.CloseModal)).isTrue();
  }

  @Test
  void cancelJustClosesTheDrawerWithoutNavigating() {
    var increment = run("cancel-new", Map.of(), null);
    assertThat(hasCommand(increment, UICommandTypeDto.CloseModal)).isTrue();
    assertThat(hasCommand(increment, UICommandTypeDto.MarkAsClean)).isTrue();
    assertThat(drawerOf(increment)).isNull();

    var editCancel = run("cancel-edit", Map.of("id", "b1"), null);
    assertThat(hasCommand(editCancel, UICommandTypeDto.CloseModal)).isTrue();
  }
}
