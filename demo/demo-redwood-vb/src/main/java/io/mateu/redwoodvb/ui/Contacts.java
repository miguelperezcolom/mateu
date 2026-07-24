package io.mateu.redwoodvb.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Fase 5 — full CRUD via AutoCrud (listing + New/Edit/Delete through the mediator flow). */
@UI("/contacts")
@Title("Contactos")
public class Contacts extends AutoCrud<Contacts.Contact> {

  @Override
  public CrudStore<Contact> store() {
    return new Repo();
  }

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Contact implements Identifiable {
    String id;
    String name;
    String email;
    String company;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static class Repo implements CrudStore<Contact> {
    private static final Map<String, Contact> db = new LinkedHashMap<>();

    static {
      db.put("c1", new Contact("c1", "Ada Lovelace", "ada@example.com", "Analytical Engine"));
      db.put("c2", new Contact("c2", "Grace Hopper", "grace@example.com", "US Navy"));
      db.put("c3", new Contact("c3", "Alan Turing", "alan@example.com", "Bletchley Park"));
    }

    @Override
    public Optional<Contact> findById(String id) {
      return Optional.ofNullable(db.get(id));
    }

    @Override
    public String save(Contact entity) {
      if (entity.getId() == null || entity.getId().isBlank()) {
        entity.setId("c" + (db.size() + 1));
      }
      db.put(entity.getId(), entity);
      return entity.getId();
    }

    @Override
    public List<Contact> findAll() {
      return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> ids) {
      ids.forEach(db::remove);
    }
  }
}
