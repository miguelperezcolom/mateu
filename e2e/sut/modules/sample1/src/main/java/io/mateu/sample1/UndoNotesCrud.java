package io.mateu.sample1;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Restorable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * W-V-DELETE-FEEDBACK fixture: a crud that can bring deleted notes back. Delete asks nothing and
 * answers "N records deleted — Undo"; Undo restores them. Its rows open by click, so the
 * technical id is not a column (W-V-TABLE-ID).
 */
@UI("/undo-notes")
@Title("Notes")
public class UndoNotesCrud extends AutoCrud<UndoNotesCrud.Note> implements Restorable<String> {

  public record Note(String id, String text) implements Identifiable {}

  static final Map<String, Note> NOTES = new LinkedHashMap<>();
  static final Map<String, Note> TRASH = new LinkedHashMap<>();

  static {
    for (var n : List.of(new Note("n1", "Buy milk"), new Note("n2", "Call Ana"), new Note("n3", "Pay rent"))) {
      NOTES.put(n.id(), n);
    }
  }

  @Override
  public CrudStore<Note> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Note> findById(String id) {
        return Optional.ofNullable(NOTES.get(id));
      }

      @Override
      public String save(Note entity) {
        NOTES.put(entity.id(), entity);
        return entity.id();
      }

      @Override
      public List<Note> findAll() {
        return new ArrayList<>(NOTES.values());
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ids.forEach(id -> {
          var removed = NOTES.remove(id);
          if (removed != null) TRASH.put(id, removed);
        });
      }
    };
  }

  @Override
  public void restoreAllById(List<String> ids, HttpRequest httpRequest) {
    ids.forEach(id -> {
      var restored = TRASH.remove(id);
      if (restored != null) NOTES.put(id, restored);
    });
  }
}
