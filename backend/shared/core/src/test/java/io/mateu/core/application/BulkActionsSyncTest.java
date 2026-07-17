package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Bulk actions on listings: a {@code @ListToolbarButton} method on the crud renders as a toolbar
 * button over the listing, requires row selection by default (the frontend keeps the selected rows
 * in the component state under {@code crud_selected_items}), and receives the SELECTION TYPED — a
 * {@code List<Row>} parameter is hydrated from the state by {@code HttpRequest.getSelectedRows}.
 */
class BulkActionsSyncTest {

  public static class Invoice implements Identifiable {
    String id;
    String customer;
    double total;
    boolean approved;

    public Invoice() {}

    public Invoice(String id, String customer, double total, boolean approved) {
      this.id = id;
      this.customer = customer;
      this.total = total;
      this.approved = approved;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Invoice> INVOICES = new ArrayList<>();
  static List<Invoice> lastApproved;

  @UI("/bulk-invoices")
  @Title("Invoices")
  public static class InvoicesCrud extends AutoCrud<Invoice> {

    @Override
    public CrudRepository<Invoice> repository() {
      return new CrudRepository<>() {
        @Override
        public Optional<Invoice> findById(String id) {
          return INVOICES.stream().filter(invoice -> invoice.id().equals(id)).findFirst();
        }

        @Override
        public String save(Invoice entity) {
          INVOICES.replaceAll(invoice -> invoice.id().equals(entity.id()) ? entity : invoice);
          return entity.id;
        }

        @Override
        public List<Invoice> findAll() {
          return INVOICES;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          INVOICES.removeIf(invoice -> selectedIds.contains(invoice.id()));
        }
      };
    }

    @ListToolbarButton
    @Label("Aprobar seleccionadas")
    public Message approve(List<Invoice> selection, HttpRequest httpRequest) {
      lastApproved = selection;
      selection.forEach(invoice -> invoice.approved = true);
      selection.forEach(
          invoice ->
              INVOICES.stream()
                  .filter(stored -> stored.id().equals(invoice.id()))
                  .forEach(stored -> stored.approved = true));
      return new Message(selection.size() + " approved");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(InvoicesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    INVOICES.clear();
    INVOICES.add(new Invoice("1", "Acme", 100.0, false));
    INVOICES.add(new Invoice("2", "Globex", 250.0, false));
    INVOICES.add(new Invoice("3", "Initech", 75.5, false));
    lastApproved = null;
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private static CrudlDto findCrudl(Object component) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof CrudlDto crudl) {
        return crudl;
      }
      for (var child : client.children()) {
        var found = findCrudl(child);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findCrudl(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private static ServerSideComponentDto findComponentWithAction(Object component, String actionId) {
    if (component instanceof ServerSideComponentDto server) {
      if (server.actions() != null
          && server.actions().stream().anyMatch(action -> actionId.equals(action.id()))) {
        return server;
      }
      for (var child : server.children()) {
        var found = findComponentWithAction(child, actionId);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      for (var child : client.children()) {
        var found = findComponentWithAction(child, actionId);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/bulk-invoices")
            .consumedRoute("/bulk-invoices")
            .serverSideType(InvoicesCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .build());
  }

  // ── wire shape ──────────────────────────────────────────────────────────────

  @Test
  void theBulkButtonTravelsOnTheListingToolbarWithItsLabelAndSelectionIsEnabled() {
    // the crud mediator loads its listing on a follow-up request (empty actionId)
    var increment = run("", Map.of());
    var crudl = findCrudl(increment.fragments().get(0).component());
    assertThat(crudl).isNotNull();
    assertThat(crudl.rowsSelectionEnabled()).isTrue();
    assertThat(crudl.toolbar()).extracting(ButtonDto::actionId).contains("action-on-row-approve");
    var button =
        crudl.toolbar().stream()
            .filter(candidate -> "action-on-row-approve".equals(candidate.actionId()))
            .findFirst()
            .orElseThrow();
    // @Label wins over the humanized method name
    assertThat(button.label()).isEqualTo("Aprobar seleccionadas");
  }

  @Test
  void theActionAdvertisesRowsSelectedRequiredSoTheFrontendGuardsEmptySelections() {
    var increment = run("", Map.of());
    var component =
        findComponentWithAction(increment.fragments().get(0).component(), "action-on-row-approve");
    assertThat(component).isNotNull();
    var action =
        component.actions().stream()
            .filter(candidate -> "action-on-row-approve".equals(candidate.id()))
            .findFirst()
            .orElseThrow();
    assertThat(action.rowsSelectedRequired()).isTrue();
  }

  // ── dispatch ────────────────────────────────────────────────────────────────

  @Test
  void theSelectionArrivesTypedAtTheBulkMethod() {
    var increment =
        run(
            "action-on-row-approve",
            Map.of(
                "crud_selected_items",
                List.of(
                    Map.of("id", "1", "customer", "Acme", "total", 100.0, "approved", false),
                    Map.of("id", "3", "customer", "Initech", "total", 75.5, "approved", false))));
    assertThat(lastApproved).isNotNull();
    assertThat(lastApproved).hasSize(2);
    assertThat(lastApproved.get(0)).isInstanceOf(Invoice.class);
    assertThat(lastApproved).extracting(invoice -> invoice.id).containsExactly("1", "3");
    // numeric state values hydrate into the typed field
    assertThat(lastApproved.get(0).total).isEqualTo(100.0);
    // the method's own return value travels as a message
    assertThat(increment.messages()).extracting(m -> m.text()).contains("2 approved");
    // and the repository rows were mutated
    assertThat(INVOICES.stream().filter(invoice -> invoice.approved).count()).isEqualTo(2);
  }

  @Test
  void builtInBulkDeleteStillRemovesTheSelectedRows() {
    run(
        "delete",
        Map.of(
            "crud_selected_items",
            List.of(Map.of("id", "2", "customer", "Globex", "total", 250.0, "approved", false))));
    assertThat(INVOICES).extracting(Invoice::id).containsExactly("1", "3");
  }
}
