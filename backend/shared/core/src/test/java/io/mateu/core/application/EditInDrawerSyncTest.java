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
import io.mateu.uidl.interfaces.CrudStore;
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
    @jakarta.validation.constraints.NotEmpty String title;
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
    public CrudStore<Book> store() {
      return new CrudStore<>() {
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

  /**
   * The row click the browser sends (the row in the parameters, the crud's id field in the state)
   * went through the navigation adjuster, which pointed the address bar at the record: the drawer
   * opened over the listing under {@code /drawer-books/b1}, the url stayed there after it closed,
   * and a reload opened the record's view page.
   */
  @Test
  void openingTheDrawerFromARowLeavesTheUrlOnTheListing() {
    var increment =
        run("view", Map.of("idFieldForRow", "id"), Map.of("id", "b1", "title", "El Quijote"));
    assertThat(drawerOf(increment)).isNotNull();
    assertThat(hasCommand(increment, UICommandTypeDto.PushStateToHistory)).isFalse();
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

  /**
   * Behind the browser's own check, the server refuses a required field left empty too, and the
   * drawer stays open with the typed values and a banner naming the field.
   */
  @Test
  void aCreationWithARequiredFieldLeftEmptyIsRefusedAndTheDrawerStays() {
    var increment = run("create", Map.of("title", "", "pages", 5), null);
    assertThat(BOOKS).hasSize(2);
    assertThat(hasCommand(increment, UICommandTypeDto.CloseModal)).isFalse();
    assertThat(drawerOf(increment)).isNotNull();
    assertThat(String.valueOf(increment)).contains("Title: Cannot be empty");
  }

  @Test
  void anEditThatEmptiesARequiredFieldIsRefused() {
    var increment = run("save", Map.of("id", "b1", "title", "", "pages", 900), null);
    assertThat(BOOKS.stream().filter(book -> "b1".equals(book.id)).findFirst().orElseThrow().title)
        .isEqualTo("El Quijote");
    assertThat(hasCommand(increment, UICommandTypeDto.CloseModal)).isFalse();
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

  private static io.mateu.dtos.ServerSideComponentDto drawerForm(DrawerDto drawer) {
    var content = drawer.content();
    assertThat(content).isInstanceOf(io.mateu.dtos.ServerSideComponentDto.class);
    return (io.mateu.dtos.ServerSideComponentDto) content;
  }

  /**
   * The drawer's form is a component of its own, exactly like the routed /new and /{id}/edit pages:
   * the editor's type, its values, its client-side validations and a create/save that is validated
   * and bubbles to the crud. It used to be plain content of the crud component, whose actions are
   * not validated: the empty required field was sent and never marked.
   */
  @Test
  void theDrawerFormValidatesInTheBrowserLikeTheRoutedForm() {
    for (var opening : List.of("new", "view")) {
      var drawer = drawerOf(run(opening, Map.of("id", "b1"), null));
      var form = drawerForm(drawer);
      assertThat(form.serverSideType()).isEqualTo(Book.class.getName());
      assertThat(form.validations())
          .anySatisfy(validation -> assertThat(validation.fieldId()).isEqualTo("title"));
      var persist = "new".equals(opening) ? "create" : "save";
      assertThat(form.actions())
          .anySatisfy(
              action -> {
                assertThat(action.id()).isEqualTo(persist);
                assertThat(action.validationRequired()).isTrue();
                assertThat(action.bubble()).isTrue();
              });
    }
    var edit = drawerForm(drawerOf(run("view", Map.of("id", "b1"), null)));
    assertThat(String.valueOf(edit.initialData())).contains("El Quijote");
  }

  /**
   * The drawer's form opts into the unsaved-changes guard exactly like the routed /new and
   * /{id}/edit pages (MultiView.wrapView): what the user types marks the drawer dirty, so closing
   * it by hand (✕, Esc, outside click, Cancel) asks before dropping it. The refused-save re-send
   * keeps the flag, and a successful save still answers MarkAsClean before CloseModal.
   */
  @Test
  void theDrawerFormIsDirtyTrackedLikeTheRoutedForm() {
    for (var opening : List.of("new", "view")) {
      var form = drawerForm(drawerOf(run(opening, Map.of("id", "b1"), null)));
      assertThat(form.confirmOnNavigationIfDirty()).as(opening).isTrue();
    }
    var refused = drawerOf(run("create", Map.of("title", "", "pages", 5), null));
    assertThat(drawerForm(refused).confirmOnNavigationIfDirty()).isTrue();

    var saved = run("save", Map.of("id", "b1", "title", "Otro", "pages", 900), null);
    var types = saved.commands().stream().map(command -> command.type()).toList();
    assertThat(types).contains(UICommandTypeDto.MarkAsClean, UICommandTypeDto.CloseModal);
    assertThat(types.indexOf(UICommandTypeDto.MarkAsClean))
        .isLessThan(types.indexOf(UICommandTypeDto.CloseModal));
  }

  /**
   * What the browser sends now: the form bubbles its save, so the crud page's state is the
   * component state and the form travels as initiatorState. A refusal re-renders the form with the
   * banner and marks the refused field invalid on it.
   */
  @Test
  void aRefusedDrawerSaveMarksTheRefusedFieldOnTheForm() {
    var increment =
        run(
            "create",
            Map.of("crud_selected_items", List.of()),
            Map.of("initiatorState", Map.of("title", "", "pages", 5)));
    assertThat(BOOKS).hasSize(2);
    assertThat(String.valueOf(increment)).contains("Title: Cannot be empty");
    assertThat(increment.fragments())
        .anySatisfy(
            fragment -> {
              assertThat(fragment.targetComponentId()).isEqualTo("crud-edit-drawer-form");
              assertThat(String.valueOf(fragment.data())).contains("title=[Cannot be empty]");
            });
    // and a valid one sent the same way persists
    var created =
        run(
            "create",
            Map.of("crud_selected_items", List.of()),
            Map.of("initiatorState", Map.of("title", "Nuevo", "pages", 5)));
    assertThat(BOOKS).hasSize(3);
    assertThat(hasCommand(created, UICommandTypeDto.CloseModal)).isTrue();
  }
}
