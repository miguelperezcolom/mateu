package com.example.app;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.test.MateuTest;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Tests the Products screens the way a user would use them, with no browser and no server: {@link
 * MateuTest} boots Mateu in this JVM with the UIs of this package (and the specs/ui YAML on the
 * class path), opens a route and lets the test read what renders, type and press buttons.
 */
class ProductsUiTest {

  MateuTest mateu;

  @BeforeEach
  void start() {
    mateu = MateuTest.builder().scan("com.example.app").start();
  }

  @AfterEach
  void stop() {
    mateu.close();
    // the store is shared by the whole app: leave it as the next test expects it
    ProductStore.INSTANCE.deleteAllById(List.of("P-100"));
  }

  @Test
  void theListingShowsTheProducts() {
    var listing = mateu.open("/products").listing();
    assertEquals(4, listing.total());
    assertEquals("Espresso machine", listing.row(0).get("name"));
  }

  @Test
  void theSearchBoxFindsAProduct() {
    var products = mateu.open("/products");
    products.listing().search("grinder");
    assertEquals(
        List.of("Coffee grinder"),
        products.listing().rows().stream().map(r -> r.get("name")).toList());
  }

  @Test
  void aNewProductIsSaved() {
    var form = mateu.open("/products").button("New").press();
    form.field("id").set("P-100");
    form.field("name").set("Tamper");
    form.field("price").set(19.5);
    form.field("status").set(ProductStatus.Available);
    form.button("Save").press();

    assertEquals("Tamper", ProductStore.INSTANCE.findById("P-100").orElseThrow().name());
  }

  @Test
  void aProductWithoutANameIsRejected() {
    var form = mateu.open("/products").button("New").press();
    form.field("id").set("P-100");
    form.button("Save").press();

    assertTrue(form.lastMessage().isError());
    assertTrue(ProductStore.INSTANCE.findById("P-100").isEmpty());
  }

  @Test
  void aRowOpensTheProduct() {
    var detail = mateu.open("/products");
    detail.listing().row("Milk frother").open();
    assertEquals("/products/P-003", detail.route());
    assertEquals("Milk frother", detail.field("name").value());
  }
}
