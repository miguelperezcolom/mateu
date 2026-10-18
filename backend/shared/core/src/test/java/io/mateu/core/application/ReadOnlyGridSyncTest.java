package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A view whose fields are ALL {@code @ReadOnly} is a read-only form: its list of rows is a grid and
 * its fields keep their labels. It used to be taken for a page of components (a class counted as a
 * form only with an EDITABLE data field), so each value was mapped by its class — the labels
 * vanished and the grid became its rows' {@code toString()} as text.
 */
class ReadOnlyGridSyncTest {

  public record Line(String product, int quantity) {}

  @UI("/ro-grid-all")
  public static class AllReadOnly {
    @ReadOnly public String customer = "Ada";
    @ReadOnly public List<Line> lines = List.of(new Line("Tea", 2));
  }

  @UI("/ro-grid-class")
  @ReadOnly
  public static class ClassReadOnly {
    public String customer = "Ada";
    public List<Line> lines = List.of(new Line("Tea", 2));
  }

  static TestMateu mateu;
  static final ObjectMapper JSON = new ObjectMapper().findAndRegisterModules();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AllReadOnly.class, ClassReadOnly.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<JsonNode> formFields(String route) {
    var found = new ArrayList<JsonNode>();
    collect(JSON.valueToTree(mateu.sync(route)), found);
    return found;
  }

  private static void collect(JsonNode node, List<JsonNode> found) {
    if (node.isObject() && "FormField".equals(node.path("type").asText())) {
      found.add(node);
    }
    node.forEach(child -> collect(child, found));
  }

  private static JsonNode field(List<JsonNode> fields, String id) {
    return fields.stream()
        .filter(f -> id.equals(f.path("fieldId").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no field " + id + " in " + fields));
  }

  @Test
  void aReadOnlyGridOnAnAllReadOnlyViewIsAGrid() {
    var fields = formFields("/ro-grid-all");
    var lines = field(fields, "lines");
    assertThat(lines.path("stereotype").asText()).isEqualTo("grid");
    assertThat(lines.path("readOnly").asBoolean()).isTrue();
    var customer = field(fields, "customer");
    assertThat(customer.path("label").asText()).isEqualTo("Customer");
    assertThat(customer.path("readOnly").asBoolean()).isTrue();
  }

  @Test
  void aClassLevelReadOnlyViewAnswersTheSame() {
    var fields = formFields("/ro-grid-class");
    assertThat(field(fields, "lines").path("stereotype").asText()).isEqualTo("grid");
    assertThat(field(fields, "customer").path("readOnly").asBoolean()).isTrue();
  }
}
