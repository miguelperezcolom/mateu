package io.mateu.demo.starwars2;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Two enough-different values to show an enum render as a small choice. */
enum Gender {
  male,
  female,
  droid,
  unknown
}

/**
 * The model — declared once as a record. Mateu infers the list columns, the form fields, the
 * validation (from the bean-validation annotations) and the create/edit/delete flow from it.
 * {@link Identifiable} marks it as having an {@code id}; {@link EditableOnlyWhenCreating} makes the
 * id editable on New and read-only afterwards.
 */
record Character(
    @Section("Identity") @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    Gender gender,
    String birthYear,
    @Section("Physical") @Min(0) int height,
    double mass,
    String homeworld)
    implements Identifiable {

  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New character";
  }
}

/**
 * The data-access port. Here it is a tiny in-memory map seeded with a handful of characters; in a
 * real app it would talk to a database. {@code AutoCrud} calls {@code find(...)} (default: filter +
 * sort + paginate over {@code findAll()}) to fill the listing, and {@code save}/{@code
 * deleteAllById} for the writes.
 */
class CharacterStore implements CrudStore<Character> {

  /** One shared instance: the ViewModel is created per request, the data must outlive it. */
  static final CharacterStore INSTANCE = new CharacterStore();

  private final Map<String, Character> db = new LinkedHashMap<>();
  private int seq = 0;

  private CharacterStore() {
    save(new Character(null, "Luke Skywalker", Gender.male, "19BBY", 172, 77, "Tatooine"));
    save(new Character(null, "Leia Organa", Gender.female, "19BBY", 150, 49, "Alderaan"));
    save(new Character(null, "Han Solo", Gender.male, "29BBY", 180, 80, "Corellia"));
    save(new Character(null, "C-3PO", Gender.droid, "112BBY", 167, 75, "Tatooine"));
    save(new Character(null, "R2-D2", Gender.droid, "33BBY", 96, 32, "Naboo"));
    save(new Character(null, "Darth Vader", Gender.male, "41.9BBY", 202, 136, "Tatooine"));
    save(new Character(null, "Yoda", Gender.unknown, "896BBY", 66, 17, "unknown"));
  }

  @Override
  public Optional<Character> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Character entity) {
    // A blank id means "create": mint the next one. Records are immutable, so rebuild with the id.
    String id =
        entity.id() == null || entity.id().isBlank()
            ? String.format("%03d", ++seq)
            : entity.id();
    db.put(
        id,
        new Character(
            id,
            entity.name(),
            entity.gender(),
            entity.birthYear(),
            entity.height(),
            entity.mass(),
            entity.homeworld()));
    return id;
  }

  @Override
  public List<Character> findAll() {
    return List.copyOf(db.values());
  }

  @Override
  public void deleteAllById(List<String> ids) {
    ids.forEach(db::remove);
  }
}

/**
 * The whole UI: a routed view that IS a CRUD over {@code Character}. Mounted at the app root, so
 * {@code http://localhost:8601/} is the listing, {@code /new} the create form and {@code /{id}/edit}
 * the editor — all generated. The only code is naming the store.
 */
@UI("")
public class Characters extends AutoCrud<Character> {

  @Override
  public CrudStore<Character> store() {
    return CharacterStore.INSTANCE;
  }
}
