package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Creatable;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.Editable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The "editable listing" idiom of the capability model: {@link Editable} WITHOUT Navigable opens
 * the editor in a drawer over the listing, plus {@link Creatable} (New → /new) and {@link Deletable}
 * (selection + Delete). Mutable, so every test works on notes it created itself (the store lives
 * for the whole JVM and the shared specs run in parallel).
 */
@UI("/capability-notes")
@Title("Capability notes")
public class CapabilityNotes
    implements Listing<CapabilityNotes.Note>,
        Searchable,
        Editable<CapabilityNotes.Note, String>,
        Creatable<CapabilityNotes.Note, String>,
        Deletable<String> {

  public record Note(String id, @NotEmpty String text) {}

  static final Map<String, Note> NOTES = new ConcurrentHashMap<>(Map.of("N-1", new Note("N-1", "First note")));

  @Override
  public ListingData<Note> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText().trim().toLowerCase();
    var rows = new ArrayList<>(NOTES.values());
    rows.removeIf(n -> !text.isEmpty() && !n.text().toLowerCase().contains(text));
    rows.sort((a, b) -> a.id().compareTo(b.id()));
    return ListingData.from(rows);
  }

  @Override
  public Note edit(String id, HttpRequest httpRequest) {
    return NOTES.get(id);
  }

  @Override
  public String save(HttpRequest httpRequest) {
    var edited = httpRequest.getComponentState(Note.class);
    NOTES.put(edited.id(), edited);
    return edited.id();
  }

  @Override
  public Note creationForm(HttpRequest httpRequest) {
    return new Note(null, "");
  }

  @Override
  public String create(HttpRequest httpRequest) {
    var created = httpRequest.getComponentState(Note.class);
    var id = "N-" + UUID.randomUUID().toString().substring(0, 8);
    NOTES.put(id, new Note(id, created.text()));
    return id;
  }

  @Override
  public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
    selectedIds.forEach(NOTES::remove);
  }
}
