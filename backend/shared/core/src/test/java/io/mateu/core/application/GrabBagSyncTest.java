package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CookieConsent;
import io.mateu.uidl.data.CookieConsentPosition;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Grab bag of small tails: editable-grid detail navigation (_prev/_next) and _create-and-stay,
 * lombok @Builder hydration, the CookieConsent mapper, @Lookup initial-value label data, arrays
 * written back from wire lists, and Actionable fields as menu options.
 */
class GrabBagSyncTest {

  // ── @Builder hydration ──────────────────────────────────────────────────────

  @lombok.Builder
  public record Shipment(String code, int weight) {}

  // ── lookup with an initial value (label data on sync) ───────────────────────

  @SuppressWarnings("unused")
  @UI("/trip2")
  public static class Trip2Form {
    @Lookup(
        search = RunnersAndMasterDetailSyncTest.CountryOptions.class,
        label = RunnersAndMasterDetailSyncTest.CountryLabel.class)
    String destination = "ES";
  }

  // ── cookie consent + arrays ─────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/legal")
  public static class LegalPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(
              List.of(
                  new Text("legal"),
                  CookieConsent.builder()
                      .message("We use cookies")
                      .cookieName("consent")
                      .position(CookieConsentPosition.Bottom)
                      .learnMoreLink("https://www.cookiesandyou.com/")
                      .build()))
          .build();
    }
  }

  @SuppressWarnings("unused")
  @UI("/tags")
  public static class TagsForm {
    String[] tags;

    static TagsForm seen;

    @Action
    void snap(HttpRequest httpRequest) {
      seen = this;
    }
  }

  // ── Actionable field as menu option ─────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/portal")
  @Title("Portal")
  public static class PortalApp {
    @Menu RouteLink docs = new RouteLink("/portal/docs", "Documentation");

    @Menu TagsHome home = new TagsHome();
  }

  @SuppressWarnings("unused")
  public static class TagsHome {
    String welcome = "hi";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            Trip2Form.class,
            LegalPage.class,
            TagsForm.class,
            PortalApp.class,
            EditableGridFieldSyncTest.OrderForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── editable-grid detail navigation ─────────────────────────────────────────

  private static Map<String, Object> gridState() {
    var state = new HashMap<String, Object>();
    state.put("lines", List.of(row("A", 1, 0), row("B", 2, 1), row("C", 3, 2)));
    state.put("lines_rowClass", EditableGridFieldSyncTest.Line.class.getName());
    return state;
  }

  private static Map<String, Object> row(String concept, int qty, int rowNumber) {
    var map = new HashMap<String, Object>();
    map.put("concept", concept);
    map.put("qty", qty);
    map.put("_rowNumber", rowNumber);
    return map;
  }

  private UIIncrementDto grid(String actionId, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/order")
            .actionId(actionId)
            .serverSideType(EditableGridFieldSyncTest.OrderForm.class.getName())
            .componentState(gridState())
            .parameters(parameters)
            .initiatorComponentId("gb_app")
            .build());
  }

  @Test
  void nextNavigatesToTheFollowingRow() {
    var increment = grid("lines_next", Map.of("initiatorState", Map.of("_rowNumber", 1)));
    assertThat(increment.fragments())
        .anySatisfy(
            fragment -> {
              @SuppressWarnings("unchecked")
              var state = (Map<String, Object>) fragment.state();
              assertThat(state).containsEntry("concept", "C").containsEntry("_position", "3/3");
            });
  }

  @Test
  void prevNavigatesToThePreviousRow() {
    var increment = grid("lines_prev", Map.of("initiatorState", Map.of("_rowNumber", 1)));
    assertThat(increment.fragments())
        .anySatisfy(
            fragment -> {
              @SuppressWarnings("unchecked")
              var state = (Map<String, Object>) fragment.state();
              assertThat(state).containsEntry("concept", "A").containsEntry("_position", "1/3");
            });
  }

  @Test
  void createAndStayAppendsAndKeepsTheDetailOpen() {
    var increment =
        grid("lines_create-and-stay", Map.of("initiatorState", Map.of("concept", "D", "qty", 4)));
    var state = firstState(increment);
    @SuppressWarnings("unchecked")
    var lines = (List<Map<String, Object>>) state.get("lines");
    assertThat(lines).hasSize(4);
    @SuppressWarnings("unchecked")
    var showDetail = (Map<String, Object>) state.get("_show_detail");
    assertThat(showDetail).containsEntry("lines", true);
  }

  // ── @Builder hydration ──────────────────────────────────────────────────────

  @Test
  void builderAnnotatedTypesHydrateThroughTheirBuilder() {
    var shipment =
        MateuInstanceFactory.newInstance(
            Shipment.class, Map.of("code", "SH-1", "weight", "12"), null);
    assertThat(shipment.code()).isEqualTo("SH-1");
    assertThat(shipment.weight()).isEqualTo(12);
  }

  // ── lookup initial label ────────────────────────────────────────────────────

  @Test
  void lookupFieldsWithAValueCarryTheirLabelInTheData() {
    var increment = mateu.sync("/trip2");
    assertThat(increment.fragments()).isNotEmpty();
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data && data.containsKey("destination-label")) {
        assertThat(data.get("destination-label")).isEqualTo("España");
        return;
      }
    }
    org.assertj.core.api.Assertions.fail("no destination-label data found");
  }

  // ── cookie consent ──────────────────────────────────────────────────────────

  @Test
  void cookieConsentMaps() {
    var increment = mateu.sync("/legal");
    var consent =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.CookieConsentDto.class);
    assertThat(consent).isNotNull();
    assertThat(consent.message()).isEqualTo("We use cookies");
  }

  // ── arrays from wire lists ──────────────────────────────────────────────────

  @Test
  void stringArraysWriteBackFromWireLists() {
    TagsForm.seen = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/tags")
            .actionId("snap")
            .serverSideType(TagsForm.class.getName())
            .componentState(Map.of("tags", List.of("x", "y")))
            .initiatorComponentId("tg_app")
            .build());
    assertThat(TagsForm.seen).isNotNull();
    assertThat(TagsForm.seen.tags).containsExactly("x", "y");
  }

  // ── Actionable menu fields ──────────────────────────────────────────────────

  @Test
  void actionableFieldsBecomeMenuOptions() {
    var increment = mateu.sync("/portal");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.menu()).extracting(io.mateu.dtos.MenuOptionDto::label).contains("Documentation");
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  @SuppressWarnings("unchecked")
  private static Map<String, Object> firstState(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) state;
      }
    }
    return Map.of();
  }
}
