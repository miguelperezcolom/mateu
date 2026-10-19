package io.mateu.core.application.authoring;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

/**
 * R6: {@code mateu_save_spec} refuses a page that would run code in the browser — a saved spec is
 * served through the ordinary (trusted) render path, so an anonymous dev-mode agent could otherwise
 * persist an {@code Element import:} that every browser opening the route executes. The cases are
 * {@code conformance/mcp/save-spec-script.json}, shared with .NET, Python and the sidecar.
 */
class SaveSpecScriptRefusalTest {

  static JsonNode corpus() throws Exception {
    var dir = Path.of("").toAbsolutePath();
    while (dir != null && !Files.isDirectory(dir.resolve("conformance"))) {
      dir = dir.getParent();
    }
    assertThat(dir).as("conformance directory").isNotNull();
    return new ObjectMapper()
        .readTree(dir.resolve("conformance/mcp/save-spec-script.json").toFile());
  }

  @Test
  void everyScriptCapableConstructIsRefusedAndAPlainPageIsNot() throws Exception {
    var corpus = corpus();
    assertThat(SpecWriter.SCRIPT_REFUSAL).isEqualTo(corpus.get("reason").asText());
    for (var c : corpus.get("cases")) {
      var refusal = SpecWriter.agentRefusal("component", c.get("yaml").asText());
      if (c.get("refused").asBoolean()) {
        assertThat(refusal).as(c.get("name").asText()).isEqualTo(SpecWriter.SCRIPT_REFUSAL);
      } else {
        assertThat(refusal).as(c.get("name").asText()).isNull();
      }
    }
  }

  @Test
  void anAliasBombIsRefusedRatherThanExpanded() {
    var yaml = new StringBuilder("a: &a [x, x, x, x, x, x, x, x, x, x]\n");
    var prev = "a";
    for (int i = 0; i < 8; i++) {
      var next = "l" + i;
      yaml.append(next).append(": &").append(next).append(" [");
      for (int j = 0; j < 10; j++) {
        yaml.append(j == 0 ? "" : ", ").append("*").append(prev);
      }
      yaml.append("]\n");
      prev = next;
    }
    assertThat(SpecWriter.agentRefusal("component", yaml.toString()))
        .isEqualTo(SpecWriter.SCRIPT_REFUSAL);
  }
}
