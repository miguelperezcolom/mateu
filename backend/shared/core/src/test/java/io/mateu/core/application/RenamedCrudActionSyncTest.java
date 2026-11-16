package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A crud's {@code action-on-row-<method>} / {@code action-on-view-<method>} naming a method the
 * crud does not have — typically a button renamed since the tab was opened (release 1 {@code
 * restock()}, release 2 {@code replenish()}) — is refused like any other unknown action: 403 and
 * one WARN. It used to answer 200 and re-render the listing, losing the active search, so the user
 * saw nothing happen.
 */
class RenamedCrudActionSyncTest {

  public static class Product implements Identifiable {
    public String id;
    public String name;

    public Product() {}

    Product(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Product> PRODUCTS = List.of(new Product("1", "Bolt"));

  @UI("/renamed-products")
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

    @ListToolbarButton(rowsSelectedRequired = false)
    @Label("Replenish")
    public Message replenish() {
      return new Message("replenished");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Products.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId) {
    Map<String, Object> state =
        Map.of(
            "_route",
            "list",
            "_componentRoute",
            "/renamed-products",
            "_componentRouteEstablished",
            true,
            "size",
            10,
            "page",
            0,
            "crud_selected_items",
            List.of());
    return mateu.run(
        RunActionRqDto.builder()
            .route("/renamed-products")
            .consumedRoute("")
            .serverSideType(Products.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1")
            .componentState(state)
            .parameters(Map.of("crud_selected_items", List.of(), "initiatorState", state))
            .build());
  }

  @Test
  void theCurrentButtonRuns() {
    assertThat(run("action-on-row-replenish").messages())
        .extracting(m -> m.text())
        .contains("replenished");
  }

  @Test
  void aRenamedRowActionIsRefusedLikeAnyUnknownAction() {
    assertThatThrownBy(() -> run("action-on-row-restock"))
        .isInstanceOf(MateuForbiddenException.class);
  }

  @Test
  void aRenamedViewActionIsRefusedLikeAnyUnknownAction() {
    assertThatThrownBy(() -> run("action-on-view-restock"))
        .isInstanceOf(MateuForbiddenException.class);
  }
}
