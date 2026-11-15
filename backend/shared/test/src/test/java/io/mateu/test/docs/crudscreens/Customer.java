package io.mateu.test.docs.crudscreens;

import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.HiddenInEditor;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.HiddenInView;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;

/**
 * Docs: "Customise each screen of a CRUD", level 1 — one record, a different set of fields on the
 * listing, the creation form, the detail and the editor. The snippet in
 * java-user-manual/build/customizing-crud-and-listings.md is this record.
 */
public record Customer(
    @EditableOnlyWhenCreating @NotEmpty String id, // typed on New, read-only afterwards
    @NotEmpty String name,
    String email,
    @HiddenInCreate @ReadOnly LocalDate customerSince, // set by the store, never typed
    @HiddenInList @HiddenInView String internalNotes, // only on the two forms
    @ReadOnlyUnless(roles = "manager") double creditLimit, // only a manager changes it
    @HiddenInCreate @HiddenInEditor @HiddenInList int openOrders) // only on the detail
    implements Identifiable {

  public Customer withOpenOrders(int openOrders) {
    return new Customer(id, name, email, customerSince, internalNotes, creditLimit, openOrders);
  }

  public Customer withEmail(String email) {
    return new Customer(id, name, email, customerSince, internalNotes, creditLimit, openOrders);
  }
}
