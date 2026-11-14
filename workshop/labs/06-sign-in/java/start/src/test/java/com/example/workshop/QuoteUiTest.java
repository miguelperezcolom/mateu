package com.example.workshop;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.MateuTest;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Workshop, lab 03: the screens you added in lab 01, tested the way a user uses them — no browser,
 * no server. The harness reads the very answer every renderer draws, so a passing test holds on
 * Vaadin, Redwood, the phone and the desktop app alike.
 */
class QuoteUiTest {

  MateuTest mateu;

  @BeforeEach
  void start() {
    mateu = MateuTest.builder().scan("com.example.workshop").start();
  }

  @AfterEach
  void stop() {
    mateu.close();
    ProductStore.INSTANCE.deleteAllById(List.of("P-200"));
  }

  @Test
  void theMenuLeadsToTheQuote() {
    var app = mateu.open("/");
    app.openMenu("Quote");
    assertEquals("/quote", app.route());
  }

  @Test
  void calculateFillsInTheTotal() {
    var quote = mateu.open("/quote");
    quote.field("quantity").set(3);
    quote.field("unitPrice").set(10.0);
    quote.field("discount").set(10);
    quote.button("Calculate").press();

    assertEquals(27.0, ((Number) quote.field("total").value()).doubleValue());
    assertTrue(quote.field("total").readOnly());
    assertTrue(quote.lastMessage().text().contains("27"));
  }

  @Test
  void theStockIsAColumnOfTheListing() {
    var listing = mateu.open("/products").listing();
    assertTrue(listing.columns().contains("stock"), "columns: " + listing.columns());
  }

  @Test
  void aNegativeStockIsRejected() {
    var form = mateu.open("/products").button("New").press();
    form.field("id").set("P-200");
    form.field("name").set("Scale");
    form.field("price").set(25.0);
    form.field("stock").set(-1);
    form.field("status").set(ProductStatus.Available);
    form.button("Save").press();

    assertTrue(form.lastMessage().isError());
    assertTrue(ProductStore.INSTANCE.findById("P-200").isEmpty());
  }
}
