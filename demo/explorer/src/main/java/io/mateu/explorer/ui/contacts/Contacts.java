package io.mateu.explorer.ui.contacts;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

enum Team {
  Engineering,
  Design,
  Sales,
  Support
}

record Contact(
    @Section(value = "Contact", columns = 2) @NotEmpty @EditableOnlyWhenCreating String id,
    @NotEmpty String name,
    String email,
    Team team)
    implements Identifiable {
  @Override
  public String toString() {
    return name != null ? name : "New contact";
  }
}

class ContactStore implements CrudStore<Contact> {

  private static final Map<String, Contact> db = seed();

  private static Map<String, Contact> seed() {
    Map<String, Contact> map = new LinkedHashMap<>();
    map.put("c1", new Contact("c1", "Ada Lovelace", "ada@example.com", Team.Engineering));
    map.put("c2", new Contact("c2", "Grace Hopper", "grace@example.com", Team.Engineering));
    map.put("c3", new Contact("c3", "Dieter Rams", "dieter@example.com", Team.Design));
    map.put("c4", new Contact("c4", "Zaha Hadid", "zaha@example.com", Team.Design));
    return map;
  }

  @Override
  public Optional<Contact> findById(String id) {
    return Optional.ofNullable(db.get(id));
  }

  @Override
  public String save(Contact entity) {
    db.put(entity.id(), entity);
    return entity.id();
  }

  @Override
  public List<Contact> findAll() {
    return List.copyOf(db.values());
  }

  @Override
  public void deleteAllById(List<String> selectedIds) {
    selectedIds.forEach(db::remove);
  }
}

/** A minimal CRUD screen backed by an in-memory store — list, search, create, edit, delete. */
@UI("/contacts")
@Title("Contacts")
public class Contacts extends AutoCrud<Contact> {

  @Override
  public CrudStore<Contact> store() {
    return new ContactStore();
  }
}
