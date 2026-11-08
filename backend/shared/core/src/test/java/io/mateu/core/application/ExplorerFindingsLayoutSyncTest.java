package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Layout and field defects found building the Mateu Explorer (3.0-beta.51): a component authored in
 * YAML — or fluently — reached the wire without what it declared.
 */
class ExplorerFindingsLayoutSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @UI("/explorer-findings-host")
  public static class Host {}


  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static JsonNode preview(String yaml) {
    var rq =
        RunActionRqDto.builder()
            .route("/explorer-findings-host")
            .consumedRoute("")
            .actionId("__preview__")
            .initiatorComponentId("content")
            .componentState(Map.of())
            .parameters(Map.of("_yaml", yaml))
            .build();
    return JSON.valueToTree(mateu.run(rq));
  }

  /** Every metadata object of the given wire type, anywhere in the answer. */
  private static List<JsonNode> metadataOfType(JsonNode node, String type) {
    var found = new ArrayList<JsonNode>();
    collect(node, type, found);
    return found;
  }

  private static void collect(JsonNode node, String type, List<JsonNode> found) {
    if (node == null) return;
    if (node.isObject()) {
      if (type.equals(node.path("type").asText())) found.add(node);
      node.elements().forEachRemaining(child -> collect(child, type, found));
    } else if (node.isArray()) {
      node.elements().forEachRemaining(child -> collect(child, type, found));
    }
  }

  @Test
  void aStandaloneKpiTravelsAsAWireTypeEveryRendererDraws() {
    var wire =
        preview(
            """
            type: HorizontalLayout
            content:
              - {type: KPI, title: Occupancy, text: "87%"}
            """);
    // it used to travel as "KPIDto" — a type name no renderer knows ("Unknown metadata type")
    assertThat(metadataOfType(wire, "KPIDto")).isEmpty();
    var stats = metadataOfType(wire, "Stat");
    assertThat(stats).hasSize(1);
    assertThat(stats.get(0).path("label").asText()).isEqualTo("Occupancy");
    assertThat(stats.get(0).path("value").asText()).isEqualTo("87%");
  }

  @Test
  void aMasterDetailLayoutCarriesItsOrientation() {
    var wire =
        preview(
            """
            type: MasterDetailLayout
            orientation: vertical
            master: {type: Text, text: master}
            detail: {type: Text, text: detail}
            """);
    var layouts = metadataOfType(wire, "MasterDetailLayout");
    assertThat(layouts).hasSize(1);
    assertThat(layouts.get(0).path("orientation").asText()).isEqualTo("vertical");
  }

  @Test
  void aFoldoutLayoutKeepsTheStyleItWasGivenInYaml() {
    var wire =
        JSON.valueToTree(
                preview(
                    """
                    type: FoldoutLayout
                    style: "height: 24rem;"
                    overview: {type: Text, text: overview}
                    panels:
                      - {type: FoldoutPanel, id: a, title: A, content: {type: Text, text: a}}
                    """))
            .toString();
    assertThat(wire).contains("height: 24rem;");
  }
}
