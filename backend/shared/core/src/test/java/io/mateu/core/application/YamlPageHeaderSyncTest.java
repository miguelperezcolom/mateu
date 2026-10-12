package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import java.nio.file.Files;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A YAML page's header, served: every element a Java page gets from its annotations and suppliers
 * ({@code @Overline}, {@code @TitlePlaceholder}, {@code @Timestamp}, {@code @BadgeInHeader},
 * {@code @KPI}, {@code PeerNavigationSupplier}, {@code RecordSwitcherSupplier}, {@code @Banner},
 * {@code @Fab}) authored as data on a {@code type: Form} reaches the wire with the field names a
 * reflected page's header has — so every renderer's header reads it alike.
 *
 * <p>Also the Java golden of the browser expander (expandPageHeader.test.ts): regenerate with
 * {@code -Dexpander.golden.write=true}.
 */
class YamlPageHeaderSyncTest {

  static TestMateu mateu;
  static final ObjectMapper MAPPER = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static JsonNode render(String route) throws Exception {
    var increment = mateu.sync("/" + route);
    assertThat(increment.fragments()).as(route + " should render").isNotEmpty();
    var json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(increment);
    if (Boolean.getBoolean("expander.golden.write")) {
      Files.writeString(
          TemplateComponentsDefinitionSyncTest.FIXTURES.resolve(route + ".golden.json"),
          json + "\n");
    }
    return MAPPER.readTree(json).path("fragments").path(0).path("component");
  }

  @Test
  void theHeaderTextsReachTheWireAsAReflectedPageSendsThem() throws Exception {
    var metadata = render("page-header-extras").path("metadata");
    assertThat(metadata.path("type").asText()).isEqualTo("Form");
    assertThat(metadata.path("overline").asText()).isEqualTo("Customers");
    assertThat(metadata.path("titlePlaceholder").asText()).isEqualTo("New customer…");
    // templates travel as written: the renderer interpolates them against the page state
    assertThat(metadata.path("timestamp").asText()).isEqualTo("Last updated ${state.updatedAt}");
  }

  @Test
  void badgesAndKpisAreTheHeaderChipsAndFacts() throws Exception {
    var metadata = render("page-header-extras").path("metadata");
    var badges = metadata.path("badges");
    assertThat(badges).hasSize(2);
    assertThat(badges.path(0).path("text").asText()).isEqualTo("${state.status}");
    assertThat(badges.path(0).path("color").asText()).isEqualTo("success");
    // no colour: the badge palette's default, as a Badge record answers
    assertThat(badges.path(1).path("color").asText()).isEqualTo("normal");
    var kpis = metadata.path("kpis");
    assertThat(kpis).hasSize(2);
    assertThat(kpis.path(0).path("title").asText()).isEqualTo("Balance");
    assertThat(kpis.path(0).path("text").asText()).isEqualTo("${state.balance}");
  }

  @Test
  void peerNavAndTheSwitcherAreThePageHeaderNavigation() throws Exception {
    var metadata = render("page-header-extras").path("metadata");
    assertThat(metadata.path("peerNav").path("prevRoute").asText()).isEqualTo("customers/1");
    assertThat(metadata.path("peerNav").path("nextLabel").asText()).isEqualTo("Next");
    var switcher = metadata.path("switcher");
    assertThat(switcher.path("options")).hasSize(2);
    assertThat(switcher.path("options").path(1).path("label").asText()).isEqualTo("Grace");
    assertThat(switcher.path("value").asText()).isEqualTo("${state.id}");
    assertThat(switcher.path("type").asText()).isEqualTo("object");
    assertThat(switcher.path("searchable").asBoolean()).isTrue();
    assertThat(switcher.path("route").asText()).isEqualTo("customers/${state._record}");
    // the supplier's action stays the default, for a renderer that does not know `route`
    assertThat(switcher.path("actionId").asText()).isEqualTo("_switchRecord");
  }

  @Test
  void aSwitcherFedByASourceCarriesTheReferenceAndItsOwnAction() throws Exception {
    var switcher = render("page-header-switcher-source").path("metadata").path("switcher");
    assertThat(switcher.path("type").asText()).isEqualTo("context");
    assertThat(switcher.path("options")).isEmpty();
    assertThat(switcher.path("optionsSource").path("ref").asText()).isEqualTo("countries");
    assertThat(switcher.path("actionId").asText()).isEqualTo("pickCountry");
    assertThat(switcher.path("route").isNull() || switcher.path("route").isMissingNode()).isTrue();
  }

  @Test
  void bannersAndFabsAreThePageBannersAndFloatingButtons() throws Exception {
    var metadata = render("page-header-extras").path("metadata");
    var banners = metadata.path("banners");
    assertThat(banners).hasSize(2);
    assertThat(banners.path(0).path("theme").asText()).isEqualTo("WARNING");
    assertThat(banners.path(0).path("hasCloseButton").asBoolean()).isTrue();
    assertThat(banners.path(0).path("description").asText()).isEqualTo("Two invoices are overdue");
    assertThat(banners.path(1).path("timeoutSeconds").asInt()).isEqualTo(5);
    var fabs = metadata.path("fabs");
    assertThat(fabs).hasSize(2);
    // sorted by order, whatever the list order
    assertThat(fabs.path(0).path("actionId").asText()).isEqualTo("newOrder");
    assertThat(fabs.path(0).path("icon").asText()).isEqualTo("vaadin:plus");
    assertThat(fabs.path(0).path("buttonStyle").asText()).isEqualTo("secondary");
    assertThat(fabs.path(1).path("id").asText()).isEqualTo("email");
    assertThat(fabs.path(1).path("buttonStyle").asText()).isEqualTo("primary");
  }

  @Test
  void aFormThatDeclaresNoneOfThemKeepsItsWire() throws Exception {
    var metadata = render("template-form-header").path("metadata");
    assertThat(metadata.path("overline").isNull()).isTrue();
    assertThat(metadata.path("kpis").isNull()).isTrue();
    assertThat(metadata.path("fabs").isNull()).isTrue();
    assertThat(metadata.path("switcher").isNull()).isTrue();
    assertThat(metadata.path("badges")).isEmpty();
    assertThat(metadata.path("banners")).isEmpty();
  }
}
