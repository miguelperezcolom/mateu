package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Every display component authored as DATA (specs/ui/display-gallery.yaml, a definition-only page
 * with no view model) reaches the wire as its own type, with its payload — not dropped, not left
 * raw, not turned into "Not found." by one record that fails to parse. Also the Java golden the
 * browser expander must reproduce for a specsOnly static bundle (expandDisplayGallery.test.ts):
 * regenerate with {@code -Dexpander.golden.write=true}.
 */
class YamlDisplayGallerySyncTest {

  static TestMateu mateu;
  static final ObjectMapper MAPPER = new ObjectMapper();
  static JsonNode increment;

  @BeforeAll
  static void boot() throws Exception {
    mateu = TestMateu.withUis();
    var rendered = mateu.sync("/display-gallery");
    var json = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(rendered);
    if (Boolean.getBoolean("expander.golden.write")) {
      Files.writeString(
          TemplateComponentsDefinitionSyncTest.FIXTURES.resolve("display-gallery.golden.json"),
          json + "\n");
    }
    increment = MAPPER.readTree(json);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static JsonNode component() {
    return increment.path("fragments").path(0).path("component");
  }

  /** Every node of the rendered tree, children and metadata-nested components alike. */
  private static List<JsonNode> nodes(JsonNode node) {
    var out = new ArrayList<JsonNode>();
    collect(node, out);
    return out;
  }

  private static void collect(JsonNode node, List<JsonNode> out) {
    if (node == null || node.isMissingNode() || node.isNull()) return;
    if (node.isArray()) {
      node.forEach(child -> collect(child, out));
      return;
    }
    if (!node.isObject()) return;
    if (node.path("metadata").path("type").isTextual()) out.add(node.path("metadata"));
    node.properties().forEach(entry -> collect(entry.getValue(), out));
  }

  private static JsonNode first(String type) {
    return nodes(component()).stream()
        .filter(metadata -> type.equals(metadata.path("type").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError(type + " is not on the wire"));
  }

  @Test
  void everyDisplayComponentReachesTheWireAsItsOwnType() {
    Set<String> types = new LinkedHashSet<>();
    nodes(component()).forEach(metadata -> types.add(metadata.path("type").asText()));
    assertThat(types)
        .contains(
            "EntityHeader",
            "Text",
            "Markdown",
            "Image",
            "Badge",
            "Avatar",
            "AvatarGroup",
            "Card",
            "Chart",
            "TrendChart",
            "Funnel",
            "Heatmap",
            "Gantt",
            "Kanban",
            "PlanningBoard",
            "MatrixGrid",
            "ActionPanel",
            "Map",
            "Timeline",
            "OrgChart",
            "Bpmn",
            "StatusList",
            "BulletedList",
            "Faq",
            "PricingTable",
            "OfferCard",
            "Testimonials",
            "FeatureGrid",
            "ProgressBar",
            "ProgressSteps",
            "Meter",
            "EmptyState",
            "Skeleton",
            "Notice",
            "CalloutCard",
            "Separator",
            "HeroSection",
            "Stat",
            "ComparisonCard",
            "Scoreboard",
            "MetricCard",
            "DashboardLayout",
            "DashboardPanel",
            "Calendar",
            "TaskQueue",
            "CustomComponent");
  }

  @Test
  void theirPayloadsTravel() {
    assertThat(first("EntityHeader").path("facts").path(0).path("label").asText())
        .isEqualTo("Since");
    assertThat(first("Markdown").path("markdown").asText()).contains("**Bold**");
    assertThat(first("AvatarGroup").path("avatars")).hasSize(3);
    assertThat(first("Chart").path("chartData").path("datasets").path(0).path("data")).hasSize(2);
    assertThat(first("Gantt").path("tasks").path(0).path("start").asText()).isEqualTo("2026-10-01");
    assertThat(first("PlanningBoard").path("blocks").path(0).path("resourceId").asText())
        .isEqualTo("r101");
    assertThat(first("MatrixGrid").path("sections").path(0).path("rows").path(0).path("cells"))
        .hasSize(2);
    assertThat(
            first("ActionPanel")
                .path("categories")
                .path(0)
                .path("actions")
                .path(0)
                .path("actionId")
                .asText())
        .isEqualTo("cancelBooking");
    assertThat(first("Map").path("markers").path(0).path("label").asText()).isEqualTo("Palma");
    assertThat(first("OrgChart").path("root").path("children").path(0).path("title").asText())
        .isEqualTo("CTO");
    assertThat(first("ProgressSteps").path("steps").path(1).path("status").asText())
        .isEqualTo("current");
    assertThat(first("Calendar").path("views")).hasSize(4);
    assertThat(first("Calendar").path("days").path(0).path("tone").asText()).isEqualTo("warning");
    assertThat(
            first("TaskQueue").path("groups").path(0).path("items").path(0).path("title").asText())
        .isEqualTo("Call Ada");
    assertThat(first("CustomComponent").path("name").asText()).isEqualTo("x-gallery-widget");
  }

  @Test
  void everyActionAComponentNamesIsAdvertised() {
    // the web client only SENDS an action its mateu-component advertises; a component naming an
    // undeclared one would be a dead click
    var actions = new LinkedHashSet<String>();
    component().path("actions").forEach(action -> actions.add(action.path("id").asText()));
    assertThat(actions)
        .contains(
            "pickTask",
            "openCard",
            "moveBlock",
            "pickBlock",
            "openCell",
            "editCell",
            "cancelBooking",
            "openMarker",
            "choosePlan",
            "addOffer",
            "newBooking",
            "reviewComplaints",
            "upgrade",
            "drillRevenue",
            "openDay",
            "openItem");
  }
}
