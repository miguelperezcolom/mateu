package io.mateu.demo.starwars4;

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

/** A planet — the CRUD model behind the second menu entry. */
record Planet(
    @EditableOnlyWhenCreating @NotEmpty String id,
    @NotEmpty String name,
    String climate,
    String terrain,
    long population)
    implements Identifiable {

  @Override
  public String toString() {
    return name != null && !name.isBlank() ? name : "New planet";
  }
}

/** In-memory store seeded with a few planets. */
class PlanetStore implements CrudStore<Planet> {

  static final PlanetStore INSTANCE = new PlanetStore();

  private final Map<String, Planet> db = new LinkedHashMap<>();
  private int seq = 0;

  private PlanetStore() {
    save(new Planet(null, "Tatooine", "arid", "desert", 200000));
    save(new Planet(null, "Alderaan", "temperate", "grasslands, mountains", 2000000000L));
    save(new Planet(null, "Hoth", "frozen", "tundra, ice caves", 0));
    save(new Planet(null, "Dagobah", "murky", "swamp, jungles", 0));
    save(new Planet(null, "Naboo", "temperate", "grassy hills, swamps", 4500000000L));
    save(new Planet(null, "Coruscant", "temperate", "cityscape", 1000000000000L));
  }

  @Override
  public Optional<Planet> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Planet entity) {
    String id =
        entity.id() == null || entity.id().isBlank() ? String.format("%03d", ++seq) : entity.id();
    db.put(id, new Planet(id, entity.name(), entity.climate(), entity.terrain(), entity.population()));
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

/** The planets CRUD, one of the shell's menu entries. */
@UI("planets")
public class Planets extends AutoCrud<Planet> {

  @Override
  public CrudStore<Planet> store() {
    return PlanetStore.INSTANCE;
  }
}
