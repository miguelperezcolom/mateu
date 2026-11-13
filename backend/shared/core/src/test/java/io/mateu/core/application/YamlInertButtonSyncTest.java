package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A YAML {@code Button} that declares no action is INERT: it reaches the wire with NO action id.
 * The label used to be echoed as one ({@code Primary} → {@code primary}), the native and Redwood
 * renderers dispatched it and the server answered 403 "not allowed" for a button that does nothing
 * (GA Explorer pass, F3). A declared action id is kept as it is.
 */
class YamlInertButtonSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  @Test
  void aButtonWithNoActionCarriesNoActionId() {
    var root =
        SpecsDir.write(
            dir,
            Map.of(
                "routes.yaml",
                """
                type: Routes
                routes:
                  - route: buttons
                    layout: buttons.yaml
                """,
                "buttons.yaml",
                """
                layout:
                  type: VerticalLayout
                  content:
                    - type: Button
                      label: Primary
                      buttonStyle: primary
                    - type: Button
                      label: Go
                      actionId: go
                """));
    var answer =
        SpecsDir.over(
            root,
            cl -> {
              try (var mateu = TestMateu.withUisAndBeans(List.of())) {
                return (JsonNode) JSON.valueToTree(mateu.sync("/buttons"));
              }
            });
    var actionIds = new HashMap<String, JsonNode>();
    collect((JsonNode) answer, actionIds);
    assertThat(actionIds).containsKeys("Primary", "Go");
    assertThat(actionIds.get("Primary").isNull()).isTrue();
    assertThat(actionIds.get("Go").asText()).isEqualTo("go");
  }

  private static void collect(JsonNode node, Map<String, JsonNode> out) {
    if (node == null) {
      return;
    }
    if (node.isObject()
        && "Button".equals(node.path("type").asText())
        && node.has("label")
        && node.has("actionId")) {
      out.put(node.get("label").asText(), node.get("actionId"));
    }
    node.forEach(child -> collect(child, out));
  }
}
