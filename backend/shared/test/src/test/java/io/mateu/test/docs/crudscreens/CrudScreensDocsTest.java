package io.mateu.test.docs.crudscreens;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.Field;
import io.mateu.test.Identity;
import io.mateu.test.MateuTest;
import io.mateu.test.Screen;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Pins the examples of the docs section "Customise each screen: creation form, detail, editor"
 * (java-user-manual/build/customizing-crud-and-listings.md): each level opens New, a record's
 * detail and its editor and checks the fields each one shows.
 */
class CrudScreensDocsTest {

  CustomerStore store;
  MateuTest mateu;

  @BeforeEach
  void start() {
    store = new CustomerStore();
    mateu =
        MateuTest.builder()
            .ui(
                Customers.class,
                CustomersWithDefaults.class,
                CustomerAccounts.class,
                CustomerDirectory.class)
            .bean(store)
            .start();
  }

  @AfterEach
  void stop() {
    mateu.close();
  }

  static List<String> ids(Screen screen) {
    return screen.fields().stream().map(Field::id).toList();
  }

  // --- level 1: field annotations --------------------------------------------------------------

  @Test
  void level1TheListingLeavesOutWhatIsHiddenInList() {
    assertEquals(
        List.of("name", "email", "customerSince", "creditLimit"),
        mateu.open("/customers").listing().columns());
  }

  @Test
  void level1TheCreationForm() {
    var form = mateu.open("/customers").button("New").press();
    assertEquals(List.of("id", "name", "email", "internalNotes", "creditLimit"), ids(form));
    assertFalse(form.field("id").readOnly(), "the code is typed on New");
    assertTrue(form.field("creditLimit").readOnly(), "ReadOnlyUnless(manager), anonymous");
    assertFalse(form.hasField("customerSince"));
  }

  @Test
  void level1TheDetail() {
    var detail = mateu.open("/customers/C-001");
    assertEquals(
        List.of("id", "name", "email", "customerSince", "creditLimit", "openOrders"), ids(detail));
  }

  @Test
  void level1TheEditor() {
    var editor = mateu.open("/customers/C-001/edit");
    assertEquals(
        List.of("id", "name", "email", "customerSince", "internalNotes", "creditLimit"),
        ids(editor));
    assertTrue(editor.field("id").readOnly(), "EditableOnlyWhenCreating");
    assertTrue(editor.field("customerSince").readOnly(), "ReadOnly");
    assertTrue(editor.field("creditLimit").readOnly(), "ReadOnlyUnless(manager), anonymous");
    assertFalse(editor.field("name").readOnly());
  }

  @Test
  void level1AManagerMayChangeTheCreditLimit() {
    var editor = mateu.open("/customers/C-001/edit", Identity.withRoles("manager"));
    assertFalse(editor.field("creditLimit").readOnly());
  }

  @Test
  void level1ACreateFillsInWhatTheFormDidNotShow() {
    var form = mateu.open("/customers").button("New").press();
    form.field("id").set("C-100");
    form.field("name").set("Carla Sanz");
    form.button("Save").press();
    var saved = store.findById("C-100").orElseThrow();
    assertEquals(LocalDate.now(), saved.customerSince(), "the store set it");
  }

  @Test
  void level1AnEditKeepsWhatTheEditorDoesNotShow() {
    var editor = mateu.open("/customers");
    editor.listing().row("Ana Ruiz").open();
    editor.button("Edit").press();
    editor.field("name").set("Ana Ruiz Gil");
    editor.button("Save").press();
    var saved = store.findById("C-001").orElseThrow();
    assertEquals("Ana Ruiz Gil", saved.name());
    assertEquals(5000, (int) saved.creditLimit(), "read-only for this user: kept");
    assertEquals(LocalDate.of(2021, 3, 1), saved.customerSince());
  }

  // --- level 2: same class, other content ------------------------------------------------------

  @Test
  void level2TheCreationFormIsPrefilled() {
    var form = mateu.open("/customers-v2").button("New").press();
    assertEquals("C-003", form.field("id").value());
    assertEquals(1000, ((Number) form.field("creditLimit").value()).intValue());
  }

  @Test
  void level2ThePrefilledCodeIsSaved() {
    var form = mateu.open("/customers-v2").button("New").press();
    form.field("name").set("Carla Sanz");
    form.button("Save").press();
    var saved = store.findById("C-003").orElseThrow();
    assertEquals("Carla Sanz", saved.name());
    // the documented caveat: creditLimit is read-only for this user, so the create does not take
    // it from the form — it starts from a fresh instance, whatever creationForm() proposed
    assertEquals(0, (int) saved.creditLimit());
  }

  @Test
  void level2APrefilledValueTheUserMayChangeIsSaved() {
    var form = mateu.open("/customers-v2", Identity.withRoles("manager")).button("New").press();
    form.field("name").set("Carla Sanz");
    form.button("Save").press();
    assertEquals(1000, (int) store.findById("C-003").orElseThrow().creditLimit());
  }

  @Test
  void level2TheDetailComputesAValue() {
    var detail = mateu.open("/customers-v2/C-001");
    assertEquals(3, ((Number) detail.field("openOrders").value()).intValue());
  }

  @Test
  void level2TheEditorProposesAValue() {
    var editor = mateu.open("/customers-v2/C-002/edit");
    assertEquals("ben.ode@example.com", editor.field("email").value());
    assertTrue(mateu.open("/customers-v2/C-002").field("email").value() == null);
  }

  // --- level 3: a class per screen -------------------------------------------------------------

  @Test
  void level3EachScreenHasItsOwnClass() {
    var form = mateu.open("/accounts").button("New").press();
    assertEquals(List.of("id", "name"), ids(form));
    assertEquals("C-003", form.field("id").value());

    var detail = mateu.open("/accounts/C-001");
    assertEquals(List.of("name", "email", "customerSince", "activity"), ids(detail));
    assertEquals("3 open orders", detail.field("activity").value());

    var editor = mateu.open("/accounts/C-001/edit");
    assertEquals(List.of("id", "name", "email"), ids(editor));
    assertTrue(editor.field("id").readOnly());
  }

  @Test
  void level3TheEditorAndTheCreationFormSave() {
    var editor = mateu.open("/accounts");
    editor.listing().row("Ben Ode").open();
    editor.button("Edit").press();
    editor.field("email").set("ben@example.com");
    editor.button("Save").press();
    var saved = store.findById("C-002").orElseThrow();
    assertEquals("ben@example.com", saved.email());
    assertEquals(1000, (int) saved.creditLimit(), "what the editor does not show is kept");

    var form = mateu.open("/accounts").button("New").press();
    form.field("name").set("Carla Sanz");
    form.button("Save").press();
    assertEquals("Carla Sanz", store.findById("C-003").orElseThrow().name());
  }

  @Test
  void level3ACapabilityListingOffersOnlyWhatItDeclares() {
    var listing = mateu.open("/directory");
    assertTrue(listing.hasButton("New"));
    var form = listing.button("New").press();
    assertEquals(List.of("id", "name"), ids(form));

    var detail = mateu.open("/directory/C-001");
    assertEquals(List.of("name", "email", "customerSince", "activity"), ids(detail));
    assertFalse(detail.hasButton("Edit"), "not Editable: no editor");
  }
}
