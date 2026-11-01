package io.mateu.core.application.authoring;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The validator's edges the shared corpus does not need to pin: every root kind, the limits, and
 * the less common shapes of a wrong value. The normative cases live in {@code
 * conformance/mcp/authoring.json} ({@code McpAuthoringCorpusTest}).
 */
class UidlValidatorTest {

  private static final ObjectMapper OM = new ObjectMapper();
  private static final UidlValidator VALIDATOR =
      new UidlValidator(AuthoringResources.specsSchema(OM), OM);

  private static JsonNode validate(String yaml) {
    return VALIDATOR.validate(yaml, null);
  }

  private static List<String> codes(JsonNode report, String list) {
    var out = new ArrayList<String>();
    report.get(list).forEach(i -> out.add(i.get("code").asText()));
    return out;
  }

  @Test
  void everyFileKindIsRecognised() {
    assertThat(validate("type: UI\nbasePath: /shop\n").get("kind").asText()).isEqualTo("mount");
    assertThat(validate("type: Project\nrenderer: vaadin\n").get("kind").asText())
        .isEqualTo("project");
    assertThat(validate("messages:\n  hello: Hola\n").get("kind").asText())
        .isEqualTo("translations");
    assertThat(validate("sources:\n  countries:\n    baseUrl: http://x\n").get("kind").asText())
        .isEqualTo("environment");
    assertThat(validate("sources: []\n").get("kind").asText()).isEqualTo("sources");
    assertThat(validate("types: []\n").get("kind").asText()).isEqualTo("types");
    assertThat(validate("actions: []\n").get("kind").asText()).isEqualTo("actions");
    assertThat(validate("routes: []\n").get("kind").asText()).isEqualTo("routes");
    assertThat(validate("content:\n  - type: Text\n    text: a\n").get("kind").asText())
        .isEqualTo("partial");
    assertThat(
            validate("components:\n  - name: Card\n    component:\n      type: Text\n")
                .get("kind")
                .asText())
        .isEqualTo("components");
    assertThat(validate("- just a scalar\n").get("kind").asText()).isEqualTo("routes");
    assertThat(codes(validate("42\n"), "errors")).containsExactly("unknown_kind");
  }

  @Test
  void anAppShellRootSkipsTheUndeclaredActionCheck() {
    var report =
        validate(
            "type: AppShell\ntitle: Shop\nmenu:\n  - type: RouteLink\n    label: Home\n"
                + "    route: /\n");
    assertThat(report.get("kind").asText()).isEqualTo("component");
    assertThat(codes(report, "warnings")).doesNotContain("undeclared_action");
  }

  @Test
  void theLimitsAreEnforced() {
    var big = "type: Text\ntext: " + "x".repeat(UidlValidator.MAX_YAML_BYTES) + "\n";
    assertThat(codes(validate(big), "errors")).containsExactly("too_large");

    // nulls in a flow list: two bytes a node, so the node cap is reached under the byte cap
    var many =
        new StringBuilder("type: VerticalLayout\ncontent: [")
            .append("~,".repeat(UidlValidator.MAX_NODES + 10))
            .append("~]\n");
    var report = validate(many.toString());
    assertThat(codes(report, "errors")).containsExactly("too_complex");
  }

  @Test
  void theLessCommonWrongValues() {
    // a mapping where an enum goes, a list where a component goes, a mapping as a type
    var report =
        validate(
            "type: FormField\nid: x\ndataType:\n  a: b\nlink: [1]\ncolumns:\n  - type:\n"
                + "      nested: true\n");
    assertThat(codes(report, "errors")).containsExactly("wrong_type", "wrong_type", "wrong_type");
    assertThat(report.get("errors").get(0).get("message").asText())
        .isEqualTo("Expected a string, found a mapping.");
    assertThat(report.get("errors").get(1).get("message").asText())
        .isEqualTo("Expected a mapping, found a list.");
    assertThat(report.get("errors").get(2).get("path").asText()).isEqualTo("$.columns[0].type");
  }

  @Test
  void aTriggerWithoutTypeNamesItsFamily() {
    var report = validate("type: VerticalLayout\ntriggers:\n  - actionId: load\ncontent: []\n");
    assertThat(report.get("errors").get(0).get("message").asText())
        .isEqualTo("Missing \"type\": a Trigger must say which one it is.");
  }

  @Test
  void aMultiDocumentStreamIsASyntaxError() {
    assertThat(codes(validate("type: Text\n---\ntype: Text\n"), "errors"))
        .containsExactly("yaml_syntax");
  }

  @Test
  void suggestionsAndPaths() {
    assertThat(UidlValidator.suggest("buton", List.of("Badge", "Button"))).isEqualTo("Button");
    assertThat(UidlValidator.suggest("xy", List.of("ab"))).isNull();
    assertThat(UidlValidator.segment("a-b")).isEqualTo("['a-b']");
    assertThat(UidlValidator.segment("it's")).isEqualTo("['it\\'s']");
    assertThat(UidlValidator.quote("a\"b\\")).isEqualTo("\"a\\\"b\\\\\"");
  }

  @Test
  void theCatalogueAndTheSchemaViews() {
    assertThat(ComponentSchemas.list("  CHART ", OM).get("count").asInt()).isPositive();
    var schema = ComponentSchemas.schemaOf("FormField", OM);
    assertThat(schema.get("definitions").has("FieldDataType")).isTrue();
    assertThat(schema.get("definitions").has("FormField")).isFalse();
  }

  @Test
  void aSourceTemplateTheServerCannotEvaluateIsFlagged() {
    var listing =
        """
        type: Listing
        rowsSource:
          url: "https://api.example.com/x?offset=${(state.page ?? 0) * 20}&id=${data.id}&ids=${state.items.map(i => i.id)}"
        columns: [{type: GridColumn, id: name}]
        """;
    var warnings = validate(listing).get("warnings");
    var messages = new ArrayList<String>();
    warnings.forEach(
        w -> {
          if ("proxy_unsafe_template".equals(w.get("code").asText())) {
            messages.add(w.get("message").asText());
          }
        });
    assertThat(messages).hasSize(2);
    assertThat(messages.get(0)).contains("${data.id}").contains("only the browser has");
    assertThat(messages.get(1)).contains("state.items.map");
    // what the server does evaluate is not flagged
    assertThat(String.join(" ", messages)).doesNotContain("state.page");
  }
}
