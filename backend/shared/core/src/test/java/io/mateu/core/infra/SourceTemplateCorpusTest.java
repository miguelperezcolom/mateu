package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;

/**
 * The proxied leg of the source-template corpus (conformance/client/source-templates.json): the
 * server must send the URL the browser would — the same corpus libs/mateu and Redwood run.
 */
class SourceTemplateCorpusTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  private static JsonNode corpus() throws Exception {
    var file =
        Path.of(System.getProperty("user.dir"))
            .resolve("../../../conformance/client/source-templates.json")
            .normalize();
    return JSON.readTree(file.toFile());
  }

  @TestFactory
  List<DynamicTest> theProxiedLegSendsWhatTheBrowserWould() throws Exception {
    var tests = new ArrayList<DynamicTest>();
    for (var c : corpus().get("cases")) {
      tests.add(
          DynamicTest.dynamicTest(
              c.get("name").asText(),
              () -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> state = JSON.convertValue(c.get("state"), Map.class);
                var url =
                    TemplateInterpolator.interpolateUrl(
                        c.get("template").asText(), state, key -> null);
                assertThat(url).isEqualTo(c.get("expected").asText());
              }));
    }
    return tests;
  }

  @Test
  void anExpressionOutsideTheSubsetRendersEmptyAndIsFlagged() {
    assertThat(ProxyExpression.isSupported("(state.page ?? 0) * 20")).isTrue();
    assertThat(ProxyExpression.isSupported("state.items.map(i => i.id)")).isFalse();
    assertThat(
            TemplateInterpolator.interpolateUrl(
                "https://api.example.com/x?ids=${state.items.map(i => i.id)}",
                Map.of("items", List.of()),
                key -> null))
        .isEqualTo("https://api.example.com/x?ids=");
  }

  @Test
  void secretsAreReadOnlyThroughTheSecretRoot() {
    assertThat(
            TemplateInterpolator.interpolate(
                "Bearer ${secret.API_KEY ?? 'none'}", Map.of(), "s3cret"::concat))
        .isEqualTo("Bearer s3cretAPI_KEY");
    assertThat(TemplateInterpolator.interpolate("${data.id}", Map.of("id", 1), key -> null))
        .as("data exists only in the browser")
        .isEmpty();
  }
}
