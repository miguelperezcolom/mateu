package io.mateu.demo.starwars5.planets;

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

/** A planet — owned by this module. */
record Planet(
    @EditableOnlyWhenCreating @NotEmpty String id, @NotEmpty String name, String climate)
    implements Identifiable {
  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New planet";
  }
}

class PlanetStore implements CrudStore<Planet> {
  static final PlanetStore INSTANCE = new PlanetStore();
  private final Map<String, Planet> db = new LinkedHashMap<>();
  private int seq = 0;

  private PlanetStore() {
    save(new Planet(null, "Tatooine", "arid"));
    save(new Planet(null, "Hoth", "frozen"));
    save(new Planet(null, "Naboo", "temperate"));
  }

  @Override
  public Optional<Planet> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Planet e) {
    String id = e.id() == null || e.id().isBlank() ? String.format("%03d", ++seq) : e.id();
    db.put(id, new Planet(id, e.name(), e.climate()));
    return id;
  }

  @Override
  public List<Planet> findAll() {
    return List.copyOf(db.values());
  }

  @Override
  public void deleteAllById(List<String> ids) {
    ids.forEach(db::remove);
  }
}

/** The planets CRUD, mounted at {@code planets}. */
@UI("planets")
public class Planets extends AutoCrud<Planet> {
  @Override
  public CrudStore<Planet> store() {
    return PlanetStore.INSTANCE;
  }
}
