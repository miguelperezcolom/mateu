package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Translator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An AutoCrud's own texts — its title, the listing's column headers, the form's labels and the enum
 * options — go through the app's {@link Translator}, like a plain page's. The crud content (the
 * load whose serverSideType is the crud class) used to reach the wire in English while the menu and
 * plain pages around it were translated.
 */
class CrudTranslationSyncTest {

  public enum Category {
    FOOD,
    TOOLS
  }

  public static class Product implements Identifiable {
    public String id;
    public String name;
    public double price;
    public Category category;

    public Product() {}

    Product(String id, String name, double price, Category category) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.category = category;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Product> PRODUCTS = List.of(new Product("p1", "Hammer", 9.5, Category.TOOLS));

  @UI("/translated-products")
  @Title("Products")
  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Product> findById(String id) {
          return PRODUCTS.stream().filter(p -> p.id.equals(id)).findFirst();
        }

        @Override
        public String save(Product entity) {
          return entity.id;
        }

        @Override
        public List<Product> findAll() {
          return PRODUCTS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static final Map<String, String> GERMAN =
      Map.of(
          "Products", "Produkte",
          "Name", "Bezeichnung",
          "Price", "Preis",
          "Category", "Kategorie",
          "Tools", "Werkzeuge",
          "Food", "Lebensmittel");

  static class GermanTranslator implements Translator {
    @Override
    public String translate(String text, HttpRequest httpRequest) {
      return GERMAN.getOrDefault(text, text);
    }
  }

  static TestMateu mateu;
  static final ObjectMapper JSON = new ObjectMapper().findAndRegisterModules();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new GermanTranslator()), Products.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String content(String route) throws Exception {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute("/translated-products")
                .serverSideType(Products.class.getName())
                .actionId("")
                .initiatorComponentId("c1_app")
                .componentState(Map.of())
                .parameters(Map.of())
                .build());
    return JSON.writeValueAsString(increment);
  }

  @Test
  void theListingSpeaksTheAppsLanguage() throws Exception {
    var json = content("/translated-products");
    assertThat(json).contains("\"Produkte\"", "\"Bezeichnung\"", "\"Preis\"");
    assertThat(json).doesNotContain("\"Products\"", "\"Name\"", "\"Price\"");
  }

  @Test
  void theFormAndItsEnumOptionsSpeakTheAppsLanguage() throws Exception {
    var json = content("/translated-products/new");
    assertThat(json).contains("\"Bezeichnung\"", "\"Preis\"", "\"Kategorie\"", "\"Werkzeuge\"");
    assertThat(json).doesNotContain("\"Name\"", "\"Price\"", "\"Tools\"");
  }
}
