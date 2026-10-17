package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.HiddenInCreate;
import io.mateu.uidl.annotations.HiddenInEditor;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * M-S3: the state a crud save posts can only change what the form let the user change. Fable's
 * repro: {@code POST route=/products/P-001/edit actionId=save state={"id":"P-001-X",…}} answered
 * "Item saved successfully", stored a NEW row P-001-X next to P-001 and navigated to
 * /products/P-001/P-001-X.
 */
class CrudMassAssignmentSyncTest {

  public record Product(
      @EditableOnlyWhenCreating String id,
      String name,
      @ReadOnly String approvedBy,
      @HiddenInEditor String internalCode)
      implements Identifiable {}

  public record Ticket(@HiddenInCreate String id, String title, @ReadOnly String status)
      implements Identifiable {}

  static final Map<String, Product> PRODUCTS = new LinkedHashMap<>();
  static final Map<String, Ticket> TICKETS = new LinkedHashMap<>();

  @UI("/ma-products")
  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return new MapStore<>(PRODUCTS);
    }
  }

  @UI("/ma-tickets")
  public static class Tickets extends AutoCrud<Ticket> {
    @Override
    public CrudStore<Ticket> store() {
      return new MapStore<>(TICKETS) {
        @Override
        public String save(Ticket entity) {
          // the store assigns ids to new tickets
          var id = entity.id() != null ? entity.id() : "T-" + (TICKETS.size() + 1);
          TICKETS.put(id, new Ticket(id, entity.title(), entity.status()));
          return id;
        }
      };
    }
  }

  static class MapStore<T extends Identifiable> implements CrudStore<T> {
    final Map<String, T> rows;

    MapStore(Map<String, T> rows) {
      this.rows = rows;
    }

    @Override
    public Optional<T> findById(String id) {
      return Optional.ofNullable(rows.get(id));
    }

    @Override
    public String save(T entity) {
      rows.put(entity.id(), entity);
      return entity.id();
    }

    @Override
    public List<T> findAll() {
      return List.copyOf(rows.values());
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
      selectedIds.forEach(rows::remove);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Products.class, Tickets.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    PRODUCTS.clear();
    PRODUCTS.put("P-001", new Product("P-001", "Anchovies", "ana", "INT-7"));
    TICKETS.clear();
    TICKETS.put("T-1", new Ticket("T-1", "Existing", "closed"));
  }

  private static UIIncrementDto run(
      String route, Class<?> type, String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("")
            .serverSideType(type.getName())
            .actionId(actionId)
            .componentState(state)
            .parameters(Map.of())
            .initiatorComponentId("c1_app")
            .build());
  }

  private static String pushedPath(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.PushStateToHistory)
        .map(c -> String.valueOf(c.data()))
        .findFirst()
        .orElse(null);
  }

  @Test
  void anEditSavesTheRecordItLoadedWhateverIdTheStateCarries() {
    var increment =
        run(
            "/ma-products/P-001/edit",
            Products.class,
            "save",
            Map.of(
                "id", "P-001-X",
                "name", "Renamed",
                "approvedBy", "mallory",
                "internalCode", "PWNED"));

    assertThat(PRODUCTS).containsOnlyKeys("P-001");
    // what the form let the user change changed; nothing else did
    assertThat(PRODUCTS.get("P-001")).isEqualTo(new Product("P-001", "Renamed", "ana", "INT-7"));
    // the record's url — not /ma-products/P-001/P-001-X
    assertThat(pushedPath(increment)).isEqualTo("/ma-products/P-001");
  }

  @Test
  void aCreateTakesNoReadOnlyOrHiddenValueFromTheState() {
    run(
        "/ma-tickets/new",
        Tickets.class,
        "create",
        Map.of("id", "T-1", "title", "Overwrite?", "status", "approved"));

    // the existing T-1 is untouched: the injected id was not the client's to choose
    assertThat(TICKETS.get("T-1")).isEqualTo(new Ticket("T-1", "Existing", "closed"));
    assertThat(TICKETS).containsKey("T-2");
    assertThat(TICKETS.get("T-2").title()).isEqualTo("Overwrite?");
    assertThat(TICKETS.get("T-2").status()).isNull();
  }
}
