package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DialogDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An {@link Auditable} CRUD: its History button opens the audit dialog, and the dialog's own
 * listing searches. On 3.0-beta.51 both legs were refused with a 403: the crud's own action
 * handlers claimed {@code history} (and knew no such action), and the dialog's island named an
 * internal listing type that is not on the wire allow-list (nor constructible from the wire).
 */
class AuditableCrudHistorySyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

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

  @UI("/audited-prices")
  @Title("Prices")
  public static class PricesCrud extends AutoCrud<Product> implements Auditable {

    @Override
    public ListingData<AuditEntry> history(
        String searchText, AuditFilters filters, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.from(
          List.of(
              new AuditEntry(
                  LocalDateTime.of(2026, 11, 2, 10, 30),
                  "ada",
                  "update",
                  "P-1 price",
                  "4.5",
                  "5.0")));
    }

    @Override
    public CrudStore<Product> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Product> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Product entity) {
          return entity.id;
        }

        @Override
        public List<Product> findAll() {
          return List.of(new Product("P-1", "Product 1"));
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PricesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto islandOf(Object node) {
    if (node instanceof ClientSideComponentDto client) {
      if (client.metadata() instanceof DialogDto dialog) {
        if (dialog.content() instanceof ServerSideComponentDto content) return content;
        var found = islandOf(dialog.content());
        if (found != null) return found;
      }
      for (var child : client.children()) {
        var found = islandOf(child);
        if (found != null) return found;
      }
    }
    if (node instanceof ServerSideComponentDto server) {
      if (server.children() != null) {
        for (var child : server.children()) {
          if (child instanceof ClientSideComponentDto c
              && c.metadata() instanceof io.mateu.dtos.CrudlDto) {
            return server;
          }
          var found = islandOf(child);
          if (found != null) return found;
        }
      }
    }
    return null;
  }

  @Test
  void historyOpensTheAuditDialogAndItsListingSearches() {
    UIIncrementDto history =
        mateu.run(
            RunActionRqDto.builder()
                .route("/audited-prices")
                .consumedRoute("/audited-prices")
                .serverSideType(PricesCrud.class.getName())
                .actionId("history")
                .initiatorComponentId("c1_app")
                .componentState(Map.of())
                .build());
    var dialogWire = JSON.valueToTree(history).toString();
    assertThat(dialogWire).contains("\"Dialog\"");

    var island =
        history.fragments().stream()
            .map(fragment -> islandOf(fragment.component()))
            .filter(java.util.Objects::nonNull)
            .findFirst()
            .orElseThrow();
    // the island must name a type the client may send back
    assertThat(island.serverSideType()).doesNotContain("AuditHistoryListing");

    var state = new HashMap<String, Object>();
    if (island.initialData() instanceof Map<?, ?> initial) {
      initial.forEach((k, v) -> state.put(String.valueOf(k), v));
    }
    var search =
        mateu.run(
            RunActionRqDto.builder()
                .route(island.route())
                .consumedRoute(island.route())
                .serverSideType(island.serverSideType())
                .actionId("search")
                .initiatorComponentId(island.id())
                .componentState(state)
                .build());
    var searchWire = JSON.valueToTree(search).toString();
    assertThat(searchWire).contains("P-1 price").doesNotContain("Product 1");
  }
}
