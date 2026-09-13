package io.mateu.demo.starwars5.characters;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** A character — this module owns the domain and its CRUD, independent of the shell. */
record Character(
    @EditableOnlyWhenCreating @NotEmpty String id, @NotEmpty String name, String homeworld)
    implements Identifiable {
  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New character";
  }
}

class CharacterStore implements CrudStore<Character> {
  static final CharacterStore INSTANCE = new CharacterStore();
  private final Map<String, Character> db = new LinkedHashMap<>();
  private int seq = 0;

  private CharacterStore() {
    save(new Character(null, "Luke Skywalker", "Tatooine"));
    save(new Character(null, "Leia Organa", "Alderaan"));
    save(new Character(null, "Han Solo", "Corellia"));
  }

  @Override
  public Optional<Character> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Character e) {
    String id = e.id() == null || e.id().isBlank() ? String.format("%03d", ++seq) : e.id();
    db.put(id, new Character(id, e.name(), e.homeworld()));
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

/** The characters CRUD, mounted at {@code characters}. The shell composes it by Maven dependency. */
@UI("characters")
public class Characters extends AutoCrud<Character> {
  @Override
  public CrudStore<Character> store() {
    return CharacterStore.INSTANCE;
  }
}
