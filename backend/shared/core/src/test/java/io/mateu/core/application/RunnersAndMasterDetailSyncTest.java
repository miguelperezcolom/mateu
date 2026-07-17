package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.DetailPart;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AuditEntry;
import io.mateu.uidl.data.AuditFilters;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.uidl.interfaces.UploadEnabled;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The remaining action runners (searchable code lookups, audit history, uploads) and the
 * master/detail pick → reload → route protocol.
 */
class RunnersAndMasterDetailSyncTest {

  // ── searchable / lookup fixtures ────────────────────────────────────────────

  public static class CountryLabel implements LookupLabelSupplier {
    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      return "ES".equals(id) ? "España" : "Unknown";
    }
  }

  public static class CountryOptions implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Option("ES", "España"), new Option("FR", "France")));
    }
  }

  @SuppressWarnings("unused")
  @UI("/booking")
  public static class BookingForm implements Auditable, UploadEnabled {
    @Searchable(label = CountryLabel.class)
    String country;

    @Lookup(search = CountryOptions.class, label = CountryLabel.class)
    String destination;

    static String uploaded;

    @Override
    public ListingData<AuditEntry> history(
        String searchText, AuditFilters filters, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.from(
          List.of(new AuditEntry(LocalDateTime.now(), "ada", "update", "country", "FR", "ES")));
    }

    @Override
    public Object processUpload(String fileId, HttpRequest httpRequest) {
      uploaded = fileId;
      return null;
    }
  }

  // ── master/detail fixture ───────────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class ResumenSection {
    String code = "R-1";
  }

  @SuppressWarnings("unused")
  public static class PagosSection {
    String status = "pending";
  }

  @SuppressWarnings("unused")
  public static class HistorialSection {
    String last = "yesterday";
  }

  @SuppressWarnings("unused")
  @UI("/reserva")
  @Title("Reserva")
  public static class ReservaMd extends MasterDetailView {
    @Section("Resumen")
    ResumenSection resumen = new ResumenSection();

    @DetailPart(label = "Pagos")
    PagosSection pagos = new PagosSection();

    @DetailPart(label = "Historial")
    HistorialSection historial = new HistorialSection();

    @Override
    protected void load(HttpRequest httpRequest) {
      resumen.code = "R-42";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BookingForm.class, ReservaMd.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private UIIncrementDto booking(String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/booking")
            .actionId(actionId)
            .serverSideType(BookingForm.class.getName())
            .componentState(Map.of())
            .parameters(parameters)
            .initiatorComponentId("bk_app")
            .build());
  }

  private UIIncrementDto reserva(
      String route, String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .serverSideType(ReservaMd.class.getName())
            .componentState(state)
            .parameters(parameters)
            .initiatorComponentId("md_app")
            .build());
  }

  // ── code-<field>: resolve a typed code to its label ─────────────────────────

  @Test
  void codeActionResolvesTheLabelForTheTypedCode() {
    var increment = booking("code-country", Map.of("code", "ES"));
    var data = dataOf(increment);
    assertThat(data).containsEntry("country-label", "España");
    assertThat(stateOf(increment)).containsEntry("country", "ES");
  }

  @Test
  void codeActionFallsBackForUnknownCodes() {
    var increment = booking("code-country", Map.of("code", "XX"));
    assertThat(dataOf(increment)).containsEntry("country-label", "Unknown");
  }

  // ── audit history ───────────────────────────────────────────────────────────

  @Test
  void historyActionReturnsTheAuditListing() {
    var increment = booking("history", Map.of());
    assertThat(increment).isNotNull();
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void theAuditListingGroupsBysaveMomentSoEachGroupReadsAsOneVersion() {
    // AuditEntry.when carries @GroupBy: the history dialog groups the field-level changes by
    // save moment — each group subtotal row IS one version of the record (old → new per field)
    var increment = booking("history", Map.of());
    var groupBy = new java.util.ArrayList<String>();
    collectGroupBy(increment.fragments().get(0).component(), groupBy);
    assertThat(groupBy).contains("when");
  }

  private static void collectGroupBy(Object component, java.util.List<String> found) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof io.mateu.dtos.CrudlDto crudl && crudl.groupBy() != null) {
        found.add(crudl.groupBy());
      }
      client.children().forEach(child -> collectGroupBy(child, found));
      if (client.metadata() instanceof io.mateu.dtos.DialogDto dialog && dialog.content() != null) {
        collectGroupBy(dialog.content(), found);
      }
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectGroupBy(child, found));
    }
  }

  // ── uploads ─────────────────────────────────────────────────────────────────

  @Test
  void processImportInvokesProcessUploadWithTheFileId() {
    BookingForm.uploaded = null;
    booking("process-import", Map.of("fileId", "file-77"));
    assertThat(BookingForm.uploaded).isEqualTo("file-77");
  }

  // ── master/detail protocol ──────────────────────────────────────────────────

  @Test
  void syncShowsTheMasterAndTheFirstPartByDefault() {
    var increment = mateu.sync("/reserva");
    var state = stateOf(increment);
    assertThat(state).isNotEmpty();
  }

  @Test
  void pickEmitsTheSelectionEvent() {
    var increment = reserva("/reserva", "__md_pick:historial", Map.of(), Map.of());
    assertThat(increment.commands())
        .anySatisfy(command -> assertThat(command.type().name()).isEqualTo("DispatchEvent"));
  }

  @Test
  void reloadEncodesTheSelectionInTheRoute() {
    var increment =
        reserva(
            "/reserva", "__md_reload", Map.of("_route", "/reserva"), Map.of("key", "historial"));
    var state = stateOf(increment);
    assertThat(String.valueOf(state.get("_route"))).contains("/__md/historial");
  }

  @Test
  void theEncodedRouteRendersTheSelectedPart() {
    var increment = reserva("/reserva/__md/historial", "", Map.of(), Map.of());
    assertThat(increment.fragments()).isNotEmpty();
    var state = stateOf(increment);
    assertThat(state).isNotEmpty();
  }

  @Test
  void reloadPreservesTheBaseRoute() {
    var increment =
        reserva(
            "/reserva",
            "__md_reload",
            Map.of("_route", "/reserva/__md/pagos"),
            Map.of("key", "historial"));
    var state = stateOf(increment);
    assertThat(String.valueOf(state.get("_route"))).isEqualTo("/reserva/__md/historial");
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) state;
      }
    }
    return Map.of();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> dataOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data && !data.isEmpty()) {
        return (Map<String, Object>) data;
      }
    }
    return Map.of();
  }
}
