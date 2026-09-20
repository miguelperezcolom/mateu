package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Pure projection tests (no backend), the Java twin of the sidecar's projection.test.mjs. They pin
 * that the native projection reproduces the same flat screen from the same serialized wire.
 */
class McpProjectionTest {

  private final ObjectMapper om = new ObjectMapper();

  private JsonNode json(String s) throws Exception {
    return om.readTree(s);
  }

  private Map<String, JsonNode> byId(JsonNode fields) {
    Map<String, JsonNode> m = new HashMap<>();
    fields.forEach(f -> m.put(f.get("id").asText(), f));
    return m;
  }

  @Test
  void extractsTitleFieldsTypesOptionsAndValues() throws Exception {
    JsonNode inc =
        json(
            """
            {"wireVersion":"3.0",
             "commands":[{"type":"SetWindowTitle","data":"Simple form"}],
             "fragments":[{"component":{"type":"ServerSide","route":"_empty","serverSideType":"com.acme.F","pageType":"form",
               "children":[
                 {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"name","label":"Name","dataType":"string","stereotype":"regular","required":true}},
                 {"type":"ClientSide","metadata":{"type":"FormField","fieldId":"colour","label":"Colour","dataType":"string","stereotype":"select",
                   "options":[{"value":"red","label":"red"},{"value":"green","label":"green"}]}}
               ]},
               "state":{"name":"Ada","colour":"green"}}]}
            """);
    ObjectNode s = McpProjection.project(inc, om);
    assertThat(s.get("title").asText()).isEqualTo("Simple form");
    assertThat(s.get("pageType").asText()).isEqualTo("form");
    assertThat(s.get("wireVersion").asText()).isEqualTo("3.0");
    assertThat(s.get("route").asText()).isEqualTo(""); // _empty normalised
    var fields = byId(s.get("fields"));
    assertThat(fields).containsKeys("name", "colour");
    assertThat(fields.get("name").get("dataType").asText()).isEqualTo("string");
    assertThat(fields.get("name").get("required").asBoolean()).isTrue();
    assertThat(fields.get("name").get("value").asText()).isEqualTo("Ada");
    assertThat(fields.get("colour").get("stereotype").asText()).isEqualTo("select");
    assertThat(fields.get("colour").get("options")).hasSize(2);
  }

  @Test
  void actionsIdsFromServerSideLabelsFromButtons() throws Exception {
    JsonNode inc =
        json(
            """
            {"wireVersion":"3.0","commands":[{"type":"SetWindowTitle","data":"Editor"}],
             "fragments":[{"component":{"type":"ServerSide","route":"editor","serverSideType":"com.acme.E",
               "actions":[{"id":"save","confirmationRequired":true,"shortcut":"ctrl+s"},{"id":"cancel"}],
               "children":[{"type":"ClientSide","metadata":{"type":"Button","actionId":"save","label":"Guardar"}}]},
               "state":{}}]}
            """);
    ObjectNode s = McpProjection.project(inc, om);
    Map<String, JsonNode> a = new HashMap<>();
    s.get("actions").forEach(x -> a.put(x.get("id").asText(), x));
    assertThat(a.get("save").get("label").asText()).isEqualTo("Guardar");
    assertThat(a.get("save").get("shortcut").asText()).isEqualTo("ctrl+s");
    assertThat(a.get("save").get("confirmationRequired").asBoolean()).isTrue();
    assertThat(a.get("cancel").get("label").asText()).isEqualTo("cancel");
  }

  @Test
  void crudlProjectsColumnsSearchableAndFilters() throws Exception {
    JsonNode inc =
        json(
            """
            {"wireVersion":"3.0","fragments":[{"component":{"type":"ServerSide","route":"products","serverSideType":"com.acme.P",
              "children":[{"type":"ClientSide","metadata":{"type":"Crudl","title":"Products","searchable":true,
                "columns":[{"metadata":{"id":"name","caption":"Name"}},{"metadata":{"id":"price","caption":"Price"}}],
                "filters":[{"fieldId":"category","label":"Category","dataType":"string"}]}}]}}]}
            """);
    ObjectNode s = McpProjection.project(inc, om);
    assertThat(s.has("listing")).isTrue();
    assertThat(s.get("listing").get("searchable").asBoolean()).isTrue();
    assertThat(s.get("listing").get("columns")).hasSize(2);
    assertThat(s.get("listing").get("filters").get(0).get("id").asText()).isEqualTo("category");
  }

  @Test
  void surfacesNavigationCommands() throws Exception {
    JsonNode inc =
        json(
            """
            {"commands":[{"type":"navigateTo","data":"/thanks"},{"type":"SetWindowTitle","data":"x"}],"fragments":[]}
            """);
    ObjectNode s = McpProjection.project(inc, om);
    assertThat(s.get("commands")).hasSize(1);
    assertThat(s.get("commands").get(0).get("type").asText()).isEqualTo("navigateTo");
  }

  @Test
  void emptyIncrementDoesNotThrow() {
    ObjectNode s = McpProjection.project(om.createObjectNode(), om);
    assertThat(s.get("fields")).isEmpty();
    assertThat(s.get("actions")).isEmpty();
  }

  @Test
  void normalizeRouteTreatsEmptyMarkerAsRoot() {
    assertThat(McpProjection.normalizeRoute("_empty")).isEqualTo("");
    assertThat(McpProjection.normalizeRoute("/products")).isEqualTo("products");
    assertThat(McpProjection.normalizeRoute(null)).isEqualTo("");
  }
}
