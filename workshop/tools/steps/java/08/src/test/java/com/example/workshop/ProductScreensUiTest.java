package com.example.workshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.MateuTest;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Workshop, lab 08: each screen of the Products CRUD shows its own fields — the creation form, the
 * detail and the editor — and New starts filled in.
 */
class ProductScreensUiTest {

  MateuTest mateu;

  @BeforeEach
  void start() {
    mateu = MateuTest.builder().scan("com.example.workshop").start();
  }

  @AfterEach
  void stop() {
    mateu.close();
    ProductStore.INSTANCE.deleteAllById(List.of("P-005"));
  }

  @Test
  void newHasNoAddedOnAndProposesTheNextCode() {
    var form = mateu.open("/products").button("New").press();
    assertFalse(form.hasField("addedOn"), "@HiddenInCreate");
    assertEquals("P-005", form.field("id").value());
    assertEquals("Available", String.valueOf(form.field("status").value()));
    assertFalse(form.field("id").readOnly(), "the code is typed on New");
  }

  @Test
  void theStoreFillsInWhatNewDoesNotShow() {
    var form = mateu.open("/products").button("New").press();
    form.field("name").set("Tamper");
    form.field("price").set(19.5);
    form.button("Save").press();

    var saved = ProductStore.INSTANCE.findById("P-005").orElseThrow();
    assertEquals("Tamper", saved.name());
    assertEquals(LocalDate.now(), saved.addedOn());
  }

  @Test
  void theDetailShowsAddedOn() {
    var detail = mateu.open("/products");
    detail.listing().row("Milk frother").open();
    assertTrue(detail.hasField("addedOn"));
  }

  @Test
  void theEditorKeepsTheCodeAndAddedOnReadOnly() {
    var editor = mateu.open("/products");
    editor.listing().row("Milk frother").open();
    editor.button("Edit").press();
    assertTrue(editor.field("id").readOnly(), "@EditableOnlyWhenCreating");
    assertTrue(editor.field("addedOn").readOnly(), "@ReadOnly");
    assertFalse(editor.field("name").readOnly());
  }
}
