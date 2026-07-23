package io.mateu.mdd.redwoodshowcase.ui.drawercrud;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Demo of {@code editInDrawer()} (the Redwood "Create and Edit - Drawer" template): New and row
 * clicks open the crud form in a drawer sliding over the listing — the listing never unmounts;
 * saving persists, closes the drawer and shows the refreshed listing, cancelling just closes it.
 */
@UI("/drawer-crud-demo")
@Title("Contacts (edit in drawer)")
public class ContactsDrawerCrud extends AutoCrud<ContactsDrawerCrud.Contact> {

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Contact implements Identifiable {
    String id;
    @NotEmpty String name;
    String email;
    String phone;

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  private static final List<Contact> CONTACTS =
      new ArrayList<>(
          List.of(
              new Contact("1", "Ada Lovelace", "ada@computing.org", "+44 555 010"),
              new Contact("2", "Grace Hopper", "grace@navy.mil", "+1 555 020"),
              new Contact("3", "Margaret Hamilton", "margaret@nasa.gov", "+1 555 030")));

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudRepository<Contact> store() {
    return new CrudRepository<>() {

      @Override
      public Optional<Contact> findById(String id) {
        return CONTACTS.stream().filter(contact -> contact.id().equals(id)).findFirst();
      }

      @Override
      public String save(Contact entity) {
        if (entity.getId() == null || entity.getId().isBlank()) {
          entity.setId(UUID.randomUUID().toString());
          CONTACTS.add(entity);
        } else {
          CONTACTS.replaceAll(contact -> contact.id().equals(entity.id()) ? entity : contact);
        }
        return entity.getId();
      }

      @Override
      public List<Contact> findAll() {
        return CONTACTS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        CONTACTS.removeIf(contact -> selectedIds.contains(contact.id()));
      }
    };
  }
}
