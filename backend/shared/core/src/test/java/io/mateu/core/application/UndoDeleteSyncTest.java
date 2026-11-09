package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Restorable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * W-V-DELETE-FEEDBACK: a crud declaring {@link Restorable} deletes without asking and answers an
 * undoable toast; its Undo restores the rows and the listing searches again. A crud without it
 * keeps today's confirmation and answers no toast.
 */
class UndoDeleteSyncTest {

  public record Note(String id, String text) implements Identifiable {}

  static final List<Note> NOTES = new ArrayList<>();
  static final List<Note> TRASH = new ArrayList<>();

  static CrudStore<Note> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Note> findById(String id) {
        return NOTES.stream().filter(n -> n.id().equals(id)).findFirst();
      }

      @Override
      public String save(Note entity) {
        NOTES.add(entity);
        return entity.id();
      }

      @Override
      public List<Note> findAll() {
        return NOTES;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        NOTES.stream().filter(n -> ids.contains(n.id())).forEach(TRASH::add);
        NOTES.removeIf(n -> ids.contains(n.id()));
      }
    };
  }

  @UI("/notes")
  @Title("Notes")
  public static class NotesCrud extends AutoCrud<Note> implements Restorable<String> {
    @Override
    public CrudStore<Note> store() {
      return UndoDeleteSyncTest.store();
    }

    @Override
    public void restoreAllById(List<String> ids, HttpRequest httpRequest) {
      TRASH.stream().filter(n -> ids.contains(n.id())).forEach(NOTES::add);
      TRASH.removeIf(n -> ids.contains(n.id()));
    }
  }

  @UI("/plain-notes")
  @Title("Notes")
  public static class PlainNotesCrud extends AutoCrud<Note> {
    @Override
    public CrudStore<Note> store() {
      return UndoDeleteSyncTest.store();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(NotesCrud.class, PlainNotesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    NOTES.clear();
    TRASH.clear();
    NOTES.add(new Note("n1", "Buy milk"));
    NOTES.add(new Note("n2", "Call Ana"));
    NOTES.add(new Note("n3", "Pay rent"));
  }

  private UIIncrementDto run(
      Class<?> crud,
      String route,
      String actionId,
      Map<String, Object> state,
      Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(crud.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static Map<String, Object> selecting(String... ids) {
    return Map.of(
        "_route",
        "list",
        "crud_selected_items",
        java.util.Arrays.stream(ids).map(id -> Map.<String, Object>of("id", id)).toList());
  }

  private static List<ActionDto> listingActions(UIIncrementDto increment) {
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    return component.actions();
  }

  @Test
  void aRestorableCrudDeletesWithoutAskingAndOffersUndo() {
    var listing = run(NotesCrud.class, "/notes", "", Map.of("_route", "list"), null);
    var delete = listingActions(listing).stream().filter(a -> a.id().equals("delete")).findFirst();
    assertThat(delete).isPresent();
    assertThat(delete.get().confirmationRequired()).isFalse();
    assertThat(listingActions(listing))
        .extracting(ActionDto::id)
        .contains(Restorable.RESTORE_ACTION);

    var answer = run(NotesCrud.class, "/notes", "delete", selecting("n1", "n3"), null);
    assertThat(NOTES).extracting(Note::id).containsExactly("n2");
    assertThat(answer.messages())
        .singleElement()
        .satisfies(
            message -> {
              assertThat(message.text()).isEqualTo("2 records deleted");
              assertThat(message.undoActionId()).isEqualTo(Restorable.RESTORE_ACTION);
              assertThat(message.undoParameters())
                  .containsEntry(Restorable.RESTORE_IDS, List.of("n1", "n3"));
            });
  }

  @Test
  void undoRestoresTheRowsAndTheListingSearchesAgain() {
    run(NotesCrud.class, "/notes", "delete", selecting("n2"), null);
    assertThat(NOTES).hasSize(2);

    var undo =
        run(
            NotesCrud.class,
            "/notes",
            Restorable.RESTORE_ACTION,
            Map.of("_route", "list"),
            Map.of(Restorable.RESTORE_IDS, List.of("n2")));
    assertThat(NOTES).extracting(Note::id).contains("n2");
    assertThat(undo.messages())
        .singleElement()
        .satisfies(message -> assertThat(message.text()).isEqualTo("1 record restored"));
    // the listing re-runs its search (Crud.LISTING_CHANGED_EVENT)
    assertThat(undo.commands())
        .anyMatch(c -> c.type() == io.mateu.dtos.UICommandTypeDto.DispatchEvent);
  }

  @Test
  void aCrudWithoutRestorableKeepsTheConfirmationAndAnswersNoToast() {
    var listing = run(PlainNotesCrud.class, "/plain-notes", "", Map.of("_route", "list"), null);
    var delete = listingActions(listing).stream().filter(a -> a.id().equals("delete")).findFirst();
    assertThat(delete).isPresent();
    assertThat(delete.get().confirmationRequired()).isTrue();
    assertThat(listingActions(listing))
        .extracting(ActionDto::id)
        .doesNotContain(Restorable.RESTORE_ACTION);

    var answer = run(PlainNotesCrud.class, "/plain-notes", "delete", selecting("n1"), null);
    assertThat(NOTES).hasSize(2);
    assertThat(answer.messages()).isEmpty();
  }

  @Test
  void restoreIsRefusedOnACrudThatDeclaresNoRestorable() {
    assertThatThrownBy(
            () ->
                run(
                    PlainNotesCrud.class,
                    "/plain-notes",
                    Restorable.RESTORE_ACTION,
                    Map.of("_route", "list"),
                    Map.of(Restorable.RESTORE_IDS, List.of("n1"))))
        .isInstanceOf(MateuForbiddenException.class);
  }
}
