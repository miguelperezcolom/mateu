package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The spring-mvc starter's path: a crud that is a MENU ENTRY of the root app, opened on its listing
 * (/products), a row clicked, Edit, Save. The record pages' actions bubble to the app, which sends
 * its own route (still the listing's, /products) and consumed route ("") — measured against "" the
 * crud's own segment read as a record id ("products"), and the save was refused with "This record
 * no longer exists". The requests below are the ones the Vaadin renderer sends, captured from the
 * starter.
 */
class CrudSaveFromListingSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public record Product(@EditableOnlyWhenCreating String id, String name, double price)
      implements Identifiable {}

  static final Map<String, Product> STORE = new ConcurrentHashMap<>();

  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Product> findById(String id) {
          return Optional.ofNullable(STORE.get(id));
        }

        @Override
        public String save(Product entity) {
          STORE.put(entity.id(), entity);
          return entity.id();
        }

        @Override
        public List<Product> findAll() {
          return List.copyOf(STORE.values());
        }

        @Override
        public void deleteAllById(List<String> ids) {
          ids.forEach(STORE::remove);
        }
      };
    }
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("My app")
  public static class Shell {
    @Menu Products products;
  }

  static final String APP = "ux_root_" + Shell.class.getName().replace('.', '_') + "_app";
  static final String CRUD_UX = "ux__products_" + Products.class.getName().replace('.', '_');

  // its own harness: a root app changes route resolution for every other fixture
  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Shell.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    STORE.clear();
    STORE.put("P-001", new Product("P-001", "Espresso machine", 249));
    STORE.put("P-002", new Product("P-002", "Coffee grinder", 89.5));
  }

  @Test
  void aRecordOpenedFromTheListingIsSavedFromItsEditForm() {
    var listState = new LinkedHashMap<String, Object>();
    listState.put("_route", "list");
    listState.put("_componentRoute", "/products");
    listState.put("_componentRouteEstablished", true);
    listState.put("idFieldForRow", "id");
    listState.put("componentRoute", "/products");

    // the listing, loaded by the crud's own mediator
    var listing =
        mateu.run(
            RunActionRqDto.builder()
                .route("/products")
                .consumedRoute("/products")
                .serverSideType(Products.class.getName())
                .actionId("")
                .initiatorComponentId(CRUD_UX)
                .componentState(listState)
                .build());
    assertThat(errors(listing)).isEmpty();

    // a row clicked: "view" bubbles to the app
    var row = new LinkedHashMap<String, Object>(Map.of("id", "P-001", "name", "Espresso machine"));
    row.put("initiatorState", listState);
    var view = sentByTheApp("view", listState, row);
    assertThat(errors(view)).isEmpty();

    // the record page, loaded by the crud's mediator at the record's route
    var viewPage = loadByTheCrud("/products/P-001");
    var viewState = pageState(viewPage);
    assertThat(viewState.get("_pageRoute")).isEqualTo("/products");

    // Edit, bubbled to the app (whose route is still the listing's)
    var edit = sentByTheApp("edit", viewState, Map.of("initiatorState", viewState));
    assertThat(errors(edit)).isEmpty();

    var editPage = loadByTheCrud("/products/P-001/edit");
    var editState = pageState(editPage);
    editState.put("name", "Espresso machine X");

    // Save, bubbled to the app
    var save = sentByTheApp("save", editState, Map.of("initiatorState", editState));

    assertThat(errors(save)).isEmpty();
    assertThat(STORE.get("P-001").name()).isEqualTo("Espresso machine X");
    assertThat(STORE.get("P-001").price()).isEqualTo(249);
    assertThat(STORE.get("P-002").name()).isEqualTo("Coffee grinder");
  }

  @Test
  void aRouteNamingAMissingRecordIsStillRefused() {
    var editPage = loadByTheCrud("/products/P-001/edit");
    var editState = pageState(editPage);
    editState.put("name", "Forged");
    var save =
        mateu.run(
            RunActionRqDto.builder()
                .route("/products/does-not-exist/edit")
                .consumedRoute("")
                .serverSideType(Products.class.getName())
                .actionId("save")
                .initiatorComponentId(APP)
                .componentState(editState)
                .parameters(Map.of("initiatorState", editState))
                .build());

    assertThat(errors(save)).anyMatch(t -> t.contains("no longer exists"));
    assertThat(STORE.get("P-001").name()).isEqualTo("Espresso machine");
  }

  private static UIIncrementDto sentByTheApp(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/products")
            .consumedRoute("")
            .serverSideType(Products.class.getName())
            .actionId(actionId)
            .initiatorComponentId(APP)
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static UIIncrementDto loadByTheCrud(String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/products")
            .serverSideType(Products.class.getName())
            .actionId("")
            .initiatorComponentId(CRUD_UX)
            .componentState(Map.of("_route", route.substring("/products".length())))
            .build());
  }

  /** The record page's initial state, as the client holds it (its id, fields and whereabouts). */
  @SuppressWarnings("unchecked")
  private static Map<String, Object> pageState(UIIncrementDto increment) {
    var tree = JSON.valueToTree(increment);
    var found = findWith(tree, "_pageRoute");
    assertThat(found).as("a record page in %s", tree).isNotNull();
    return new LinkedHashMap<>(JSON.convertValue(found, Map.class));
  }

  private static JsonNode findWith(JsonNode node, String key) {
    if (node == null) {
      return null;
    }
    if (node.isObject() && node.has(key)) {
      return node;
    }
    for (var child : node) {
      var found = findWith(child, key);
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  private static List<String> errors(UIIncrementDto increment) {
    return increment.messages() == null
        ? List.of()
        : increment.messages().stream()
            .filter(m -> "error".equalsIgnoreCase(String.valueOf(m.variant())))
            .map(m -> m.text())
            .toList();
  }
}
