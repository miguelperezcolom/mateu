package io.mateu.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.fixtures.ProductStore;
import io.mateu.test.fixtures.Shell;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MateuTestTest {

  ProductStore store;
  MateuTest mateu;

  @BeforeEach
  void start() {
    store = new ProductStore();
    mateu = MateuTest.builder().ui(Shell.class).bean(store).start();
  }

  @AfterEach
  void stop() {
    mateu.close();
  }

  @Test
  void theShellShowsItsMenuAndItsHome() {
    var screen = mateu.open("/");
    assertEquals(List.of("Home", "Products", "Greeting"), screen.menu());
    assertEquals("My app", screen.title());
    assertTrue(screen.shows("My app"), "the home's hero title");
    assertTrue(screen.hasButton("Browse products"));
  }

  @Test
  void aWelcomeButtonNavigates() {
    var screen = mateu.open("/").button("Browse products").press();
    assertEquals("/products", screen.route());
    assertEquals(4, screen.listing().rows().size());
  }

  @Test
  void aListingShowsItsFirstPage() {
    var listing = mateu.open("/products").listing();
    assertEquals(List.of("name", "price", "status"), listing.columns());
    assertEquals(4, listing.total());
    assertEquals("Espresso machine", listing.row(0).get("name"));
  }

  @Test
  void aListingSearches() {
    var screen = mateu.open("/products");
    screen.listing().search("coffee");
    assertEquals(1, screen.listing().rows().size());
    assertEquals("Coffee grinder", screen.listing().row(0).get("name"));
  }

  @Test
  void theMenuOpensAScreen() {
    var screen = mateu.open("/").openMenu("Products");
    assertEquals("/products", screen.route());
    assertTrue(screen.hasListing());
  }

  @Test
  void aCrudCreatesARecord() {

    var screen = mateu.open("/products").button("New").press();
    screen.field("id").set("P-005");
    screen.field("Name").set("Kettle");
    screen.field("price").set(25);
    screen.field("status").set("Available");
    screen.button("Save").press();
    assertTrue(store.findById("P-005").isPresent(), "saved in the store");
    assertEquals("Kettle", store.findById("P-005").get().name());
  }

  @Test
  void aRejectedSaveKeepsTheForm() {
    var screen = mateu.open("/products").button("New").press();
    screen.button("Save").press();
    assertEquals(4, store.findAll().size());
    assertTrue(screen.messages().stream().anyMatch(Message::isError), screen.messages().toString());
  }

  @Test
  void aRowOpensItsRecord() {
    var screen = mateu.open("/products");
    screen.listing().row("Coffee grinder").open();
    assertEquals("Coffee grinder", screen.field("name").value());
  }

  @Test
  void aCrudEditsARecord() {
    var screen = mateu.open("/products");
    screen.listing().row("Coffee grinder").open();
    screen.button("Edit").press();
    screen.field("name").set("Burr grinder");
    screen.button("Save").press();
    assertEquals("Burr grinder", store.findById("P-002").get().name());
  }

  @Test
  void aCrudDeletesTheSelectedRows() {
    var screen = mateu.open("/products");
    screen.listing().row("Milk frother").select();
    screen.button("Delete").press();
    assertTrue(store.findById("P-003").isEmpty());
    assertEquals(3, screen.listing().rows().size());
  }

  @Test
  void aFormActionShowsAMessage() {
    var screen = mateu.open("/greeting");
    screen.field("name").set("Ada");
    screen.field("times").set(2);
    screen.button("greet").press();
    assertEquals("Hello Ada! Hello Ada!", screen.lastMessage().text());
  }

  @Test
  void validationRejectsAnEmptyRequiredField() {
    var screen = mateu.open("/greeting");
    assertTrue(screen.field("name").required());
    screen.button("greet").press();
    assertTrue(screen.lastMessage().isError());
    assertEquals("There are validation errors", screen.lastMessage().title());
  }

  @Test
  void accessRulesFollowTheIdentity() {
    var visitor = mateu.open("/greeting");
    assertFalse(visitor.hasField("note"), "@EyesOnly hides it");
    assertTrue(visitor.field("code").readOnly(), "@ReadOnlyUnless locks it");
    assertFalse(visitor.button("reset").enabled(), "@DisabledUnless disables it");

    var admin = mateu.open("/greeting", Identity.withRoles("admin"));
    assertTrue(admin.hasField("Internal note"));
    assertFalse(admin.field("code").readOnly());
    assertTrue(admin.button("reset").enabled());
  }

  @Test
  void aToolbarActionReturningAUriNavigates() {
    var screen = mateu.open("/greeting");
    screen.field("name").set("Ada");
    screen.button("goHome").press();
    assertEquals("/home", screen.route());
  }

  @Test
  void aMissingElementSaysWhatThereIs() {
    var screen = mateu.open("/greeting");
    var error = assertThrows(AssertionError.class, () -> screen.field("nope"));
    assertTrue(error.getMessage().contains("name"), error.getMessage());
  }

  @Test
  void aDisabledButtonCannotBePressed() {
    var screen = mateu.open("/greeting");
    assertThrows(AssertionError.class, () -> screen.button("reset").press());
  }
}
