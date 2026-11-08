package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A definition-only RECORD page: read-only fields whose values come raw from a REST source (249,
 * AVAILABLE). The renderers format a read-only amount and show an option's label the way a
 * reflected Java form reads; what they need for it — the money data type or stereotype, the
 * options, the status data type — must reach the wire from the YAML as declared.
 */
class YamlReadOnlyRecordSyncTest {

  private static final ObjectMapper JSON = new ObjectMapper().registerModule(new JavaTimeModule());

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static JsonNode field(String id) {
    var increment = mateu.sync("/yaml-readonly-record");
    assertThat(increment.fragments()).isNotEmpty();
    var found = new ArrayList<JsonNode>();
    collect(JSON.valueToTree(increment), found);
    return found.stream()
        .filter(f -> id.equals(f.path("fieldId").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no field " + id + " on the wire"));
  }

  private static void collect(JsonNode node, List<JsonNode> found) {
    if (node.isObject()) {
      if (node.has("fieldId") && "FormField".equals(node.path("type").asText())) {
        found.add(node);
      }
      node.forEach(child -> collect(child, found));
    } else if (node.isArray()) {
      node.forEach(child -> collect(child, found));
    }
  }

  @Test
  void aReadOnlyAmountKeepsItsMoneyIntent() {
    assertThat(field("price").path("readOnly").asBoolean()).isTrue();
    assertThat(field("price").path("stereotype").asText()).isEqualTo("money");
    assertThat(field("amount").path("dataType").asText()).isEqualTo("money");
  }

  @Test
  void aReadOnlySelectKeepsItsOptions() {
    var options = new ArrayList<String>();
    field("status")
        .path("options")
        .forEach(o -> options.add(o.path("value").asText() + "=" + o.path("label").asText()));
    assertThat(options).containsExactly("AVAILABLE=Available", "OUT_OF_STOCK=Out of stock");
  }

  @Test
  void aReadOnlyStatusKeepsItsDataType() {
    assertThat(field("state").path("dataType").asText()).isEqualTo("status");
  }
}
