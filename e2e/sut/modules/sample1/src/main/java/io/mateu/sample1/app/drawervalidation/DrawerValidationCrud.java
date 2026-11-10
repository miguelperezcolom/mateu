package io.mateu.sample1.app.drawervalidation;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * The create/edit drawer validates like the routed form: a required field left empty is blocked
 * in the browser and marked, and so is an @Email that is not well formed.
 */
@UI("/drawer-validation")
@Title("Drawer validation")
public class DrawerValidationCrud extends AutoCrud<DrawerValidationCrud.Contact> {

  public static class Contact implements Identifiable {
    public String id;
    @NotEmpty public String name;
    @Email public String email;

    public Contact() {}

    Contact(String id, String name, String email) {
      this.id = id;
      this.name = name;
      this.email = email;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Contact> CONTACTS =
      new ArrayList<>(List.of(new Contact("c1", "Ada", "ada@example.com")));

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudStore<Contact> store() {
    return new CrudStore<>() {
      @Override
      public synchronized Optional<Contact> findById(String id) {
        return CONTACTS.stream().filter(c -> c.id.equals(id)).findFirst();
      }

      @Override
      public synchronized String save(Contact entity) {
        if (entity.id == null || entity.id.isBlank()) {
          entity.id = "c" + (CONTACTS.size() + 1);
          CONTACTS.add(entity);
        } else {
          CONTACTS.replaceAll(c -> c.id.equals(entity.id) ? entity : c);
        }
        return entity.id;
      }

      @Override
      public synchronized List<Contact> findAll() {
        return List.copyOf(CONTACTS);
      }

      @Override
      public synchronized void deleteAllById(List<String> ids) {
        CONTACTS.removeIf(c -> ids.contains(c.id));
      }
    };
  }
}
