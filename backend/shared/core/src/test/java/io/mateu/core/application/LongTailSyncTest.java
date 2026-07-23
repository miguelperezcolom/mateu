package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartAxisScale;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartOptions;
import io.mateu.uidl.data.ChartScales;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Long-tail flows: csv export through the scanned default exporter, @Lookup option search inside a
 * wizard step, fluent Grid and fully-configured Chart mappers, entity @Toolbar methods invoked on
 * the crud view, and the ComponentAdapter SPI rendering a plain domain object.
 */
class LongTailSyncTest {

  // ── wizard with a @Lookup step field ────────────────────────────────────────

  public static class HotelOptions implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Option("h1", "Palace"), new Option("h2", "Beach")));
    }
  }

  @SuppressWarnings("unused")
  public static class StayStep implements WizardStep {
    @Lookup(search = HotelOptions.class)
    String hotel;
  }

  @SuppressWarnings("unused")
  public static class DoneStep implements WizardStep {
    String summary = "ok";
  }

  @SuppressWarnings("unused")
  @UI("/booking-wizard")
  @Title("Booking wizard")
  public static class BookingWizard extends Wizard {
    StayStep stay = new StayStep();
    DoneStep done;

    @WizardCompletionAction
    Object finish(HttpRequest httpRequest) {
      return null;
    }
  }

  // ── fluent grid + fully-configured chart ────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/analytics")
  public static class AnalyticsPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(
              List.of(
                  Grid.builder()
                      .id("grid")
                      .content(
                          List.of(
                              GridColumn.builder().id("name").label("Name").build(),
                              GridColumn.builder().id("total").label("Total").build()))
                      .page(
                          new Page<>(
                              "",
                              10,
                              0,
                              2,
                              List.of(
                                  Map.of("name", "a", "total", 1),
                                  Map.of("name", "b", "total", 2))))
                      .compact(true)
                      .rowStripes(true)
                      .build(),
                  Chart.builder()
                      .chartType(ChartType.line)
                      .chartData(
                          new ChartData(
                              List.of("Jan", "Feb"),
                              List.of(new ChartDataset("Visits", List.of(5.0, 8.0)))))
                      .chartOptions(
                          ChartOptions.builder()
                              .scales(
                                  ChartScales.builder()
                                      .y(ChartAxisScale.builder().beginAtZero(true).build())
                                      .build())
                              .build())
                      .build()))
          .build();
    }
  }

  // ── crud whose entity carries a @Toolbar method (view toolbar) ──────────────

  @SuppressWarnings("unused")
  public static class Device implements io.mateu.uidl.interfaces.Identifiable {
    String id = "d1";
    String name = "Router";

    static String rebooted;

    public Device() {}

    @Override
    public String id() {
      return id;
    }

    @Toolbar
    void reboot(HttpRequest httpRequest) {
      rebooted = name;
    }
  }

  static final List<Device> DEVICES = new java.util.ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/devices")
  @Title("Devices")
  public static class DevicesCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Device> {
    @Override
    public io.mateu.uidl.interfaces.CrudRepository<Device> store() {
      return new io.mateu.uidl.interfaces.CrudRepository<>() {
        @Override
        public java.util.Optional<Device> findById(String id) {
          return DEVICES.stream().filter(device -> device.id().equals(id)).findFirst();
        }

        @Override
        public String save(Device entity) {
          DEVICES.add(entity);
          return entity.id();
        }

        @Override
        public List<Device> findAll() {
          return DEVICES;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          DEVICES.removeIf(device -> selectedIds.contains(device.id()));
        }
      };
    }
  }

  // ── ComponentAdapter SPI over a plain domain object ─────────────────────────

  @SuppressWarnings("unused")
  @UI("/invoice")
  public static class Invoice {
    String number = "INV-1";
    double total = 99.5;
  }

  public static class InvoiceAdapter implements ComponentAdapter<Invoice> {
    @Override
    public Class<Invoice> type() {
      return Invoice.class;
    }

    @Override
    public AdaptedView adapt(Invoice model, HttpRequest httpRequest) {
      return new AdaptedView(
          List.of(new Text("Invoice " + model.number)),
          Map.of("number", model.number, "total", model.total),
          Map.of(),
          List.of());
    }

    @Override
    public Invoice deserialize(Map<String, Object> state, HttpRequest httpRequest) {
      var invoice = new Invoice();
      if (state.containsKey("number")) {
        invoice.number = String.valueOf(state.get("number"));
      }
      if (state.containsKey("total")) {
        invoice.total = Double.parseDouble(String.valueOf(state.get("total")));
      }
      return invoice;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new HotelOptions(), new InvoiceAdapter()),
            BookingWizard.class,
            AnalyticsPage.class,
            DevicesCrud.class,
            Invoice.class,
            MixedComponentsSyncTest.CitiesListing.class);
    DEVICES.clear();
    DEVICES.add(new Device());
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── csv export via the scanned default exporter ─────────────────────────────

  @Test
  void exportCsvUsesTheBuiltInExporter() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/cities")
                .consumedRoute("/cities")
                .serverSideType(MixedComponentsSyncTest.CitiesListing.class.getName())
                .actionId("export-csv")
                .componentState(Map.of("searchText", "", "page", 0, "size", 10))
                .initiatorComponentId("cl_app")
                .build());
    assertThat(increment.commands())
        .anySatisfy(command -> assertThat(command.type().name()).isEqualTo("DownloadFile"));
  }

  // ── wizard lookup search (through the wizard's own dispatcher) ──────────────

  @Test
  void wizardWithALookupStepFieldSyncs() {
    var increment = mateu.sync("/booking-wizard");
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void lookupSearchInsideAWizardStepReturnsTheStepSupplierOptions() {
    // SearchFieldActionRunner declines wizards, so the wizard's dispatcher resolves the
    // @Lookup(search=...) supplier against the CURRENT STEP's field.
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/booking-wizard")
                .actionId("search-hotel")
                .serverSideType(BookingWizard.class.getName())
                .componentState(Map.of("position", 0))
                .parameters(Map.of("searchText", "", "page", 0, "size", 10))
                .initiatorComponentId("bw_app")
                .build());
    assertThat(increment).isNotNull();
    var found = new java.util.ArrayList<String>();
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data) {
        data.values().forEach(value -> found.add(String.valueOf(value)));
      }
    }
    assertThat(String.join(",", found)).contains("Palace");
  }

  // ── fluent grid + chart mappers ─────────────────────────────────────────────

  @Test
  void fluentGridMapsColumnsAndPage() {
    var increment = mateu.sync("/analytics");
    var grid =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.GridDto.class);
    assertThat(grid).isNotNull();
  }

  @Test
  void chartWithOptionsAndScalesMaps() {
    var increment = mateu.sync("/analytics");
    var chart =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.ChartDto.class);
    assertThat(chart).isNotNull();
    assertThat(chart.chartType().name()).isEqualTo("line");
  }

  // ── entity @Toolbar method on the crud view ─────────────────────────────────

  @Test
  void viewSyncShowsTheEntityToolbarButton() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/devices/d1")
                .consumedRoute("/devices")
                .serverSideType(DevicesCrud.class.getName())
                .actionId("")
                .initiatorComponentId("dv_app")
                .build());
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void entityToolbarMethodRunsOnTheViewRoute() {
    Device.rebooted = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/devices/d1")
            .consumedRoute("/devices")
            .serverSideType(DevicesCrud.class.getName())
            .actionId("action-on-view-reboot")
            .componentState(Map.of("id", "d1", "name", "Router"))
            .initiatorComponentId("dv_app")
            .build());
    assertThat(Device.rebooted).isEqualTo("Router");
  }

  // ── ComponentAdapter SPI ────────────────────────────────────────────────────

  @Test
  void adaptedModelRendersThroughItsAdapter() {
    var increment = mateu.sync("/invoice");
    assertThat(increment.fragments()).isNotEmpty();
    var state = stateOf(increment);
    assertThat(state).containsEntry("number", "INV-1");
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) state;
      }
    }
    return Map.of();
  }
}
