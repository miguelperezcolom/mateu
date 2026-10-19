package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.authoring.AuthoringResources;
import io.mateu.core.application.authoring.UidlValidator;
import io.mateu.core.application.authoring.ValidationContext;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java reference of {@code conformance/mcp/authoring.json} — the MCP authoring contract the
 * .NET and Python backends and the sidecar pin too: the tool list (byte for byte), the resource
 * list, the validation reports and the preview of a sample page.
 *
 * <p>The expected values are generated from here and then frozen: {@code mvn -pl shared/core test
 * -Dtest=McpAuthoringCorpusTest -Dmcp.corpus.write=true}. Regenerating because a port disagrees is
 * exactly what the corpus exists to prevent.
 */
class McpAuthoringCorpusTest {

  private static final ObjectMapper OM = new ObjectMapper();
  private static final boolean WRITE = Boolean.getBoolean("mcp.corpus.write");

  @UI("/mcp-authoring-home")
  @Title("Authoring home")
  public static class Home {}

  static TestMateu mateu;
  static McpService mcp;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Home.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static Path corpusFile() {
    var dir = Path.of(System.getProperty("user.dir")).toAbsolutePath();
    while (dir != null && !Files.isDirectory(dir.resolve("conformance"))) {
      dir = dir.getParent();
    }
    return dir.resolve("conformance/mcp/authoring.json");
  }

  /** The tool, resource and validation parts, checked (or regenerated) together. */
  @Test
  void theCorpusMatchesTheJavaReference() throws Exception {
    var corpus = (ObjectNode) OM.readTree(Files.readString(corpusFile()));

    var tools = McpJsonRpc.tools(OM, false);
    var all = McpJsonRpc.tools(OM, true);
    var devTools = OM.createArrayNode();
    for (int i = tools.size(); i < all.size(); i++) devTools.add(all.get(i));
    var resources =
        McpJsonRpc.handle(
                OM.createObjectNode().put("id", 1).put("method", "resources/list"),
                mcp,
                "",
                FakeHttpRequest::new,
                OM)
            .path("result")
            .path("resources");

    var validator = new UidlValidator(AuthoringResources.specsSchema(OM), OM);
    var actualReports = new ArrayList<JsonNode>();
    for (var c : corpus.get("validate")) {
      actualReports.add(
          normalized(validator.validate(c.get("yaml").asText(), contextOf(c.get("context")))));
    }

    var actualPreviews = new ArrayList<JsonNode>();
    for (var c : corpus.get("preview")) {
      actualPreviews.add(previewSummary(c.get("yaml").asText()));
    }

    var lists = new ArrayList<JsonNode>();
    for (var c : corpus.get("listComponents")) {
      var listed =
          io.mateu.core.application.authoring.ComponentSchemas.list(c.get("query").asText(), OM);
      lists.add(c.get("query").asText().isEmpty() ? listed.get("count") : listed);
    }
    var schemas = new ArrayList<JsonNode>();
    for (var c : corpus.get("componentSchemas")) {
      try {
        schemas.add(
            io.mateu.core.application.authoring.ComponentSchemas.schemaOf(
                c.get("type").asText(), OM));
      } catch (io.mateu.uidl.UserFacingException e) {
        schemas.add(OM.getNodeFactory().textNode(e.getMessage()));
      }
    }

    if (WRITE) {
      for (int i = 0; i < lists.size(); i++) {
        var c = (ObjectNode) corpus.get("listComponents").get(i);
        c.set(c.has("expectedCount") ? "expectedCount" : "expected", lists.get(i));
      }
      for (int i = 0; i < schemas.size(); i++) {
        var c = (ObjectNode) corpus.get("componentSchemas").get(i);
        c.set(c.has("expectedError") ? "expectedError" : "expected", schemas.get(i));
      }
      corpus.set("tools", tools);
      corpus.set("devTools", devTools);
      corpus.set("resources", resources);
      for (int i = 0; i < actualReports.size(); i++) {
        ((ObjectNode) corpus.get("validate").get(i)).set("expected", actualReports.get(i));
      }
      for (int i = 0; i < actualPreviews.size(); i++) {
        ((ObjectNode) corpus.get("preview").get(i)).set("expected", actualPreviews.get(i));
      }
      Files.writeString(
          corpusFile(), OM.writerWithDefaultPrettyPrinter().writeValueAsString(corpus) + "\n");
      return;
    }

    assertThat(tools).as("tools/list").isEqualTo(corpus.get("tools"));
    assertThat(devTools)
        .as("tools/list in dev mode (the extra tools)")
        .isEqualTo(corpus.get("devTools"));
    assertThat(resources).as("resources/list").isEqualTo(corpus.get("resources"));
    for (int i = 0; i < actualReports.size(); i++) {
      var c = corpus.get("validate").get(i);
      assertThat(actualReports.get(i)).as(c.get("name").asText()).isEqualTo(c.get("expected"));
    }
    for (int i = 0; i < actualPreviews.size(); i++) {
      var c = corpus.get("preview").get(i);
      assertThat(actualPreviews.get(i)).as(c.get("name").asText()).isEqualTo(c.get("expected"));
    }
    for (int i = 0; i < lists.size(); i++) {
      var c = corpus.get("listComponents").get(i);
      assertThat(lists.get(i))
          .isEqualTo(c.has("expectedCount") ? c.get("expectedCount") : c.get("expected"));
    }
    for (int i = 0; i < schemas.size(); i++) {
      var c = corpus.get("componentSchemas").get(i);
      assertThat(schemas.get(i))
          .isEqualTo(c.has("expectedError") ? c.get("expectedError") : c.get("expected"));
    }
  }

  /** What a preview case pins: rendered, the projected fields and actions, the validation. */
  static JsonNode previewSummary(String yaml) {
    var preview = mcp.preview(yaml, "", "", FakeHttpRequest::new);
    var out = OM.createObjectNode();
    out.put("rendered", preview.path("rendered").asBoolean());
    out.set("fields", preview.path("screen").path("fields"));
    out.set("actions", preview.path("screen").path("actions"));
    out.set("validation", preview.get("validation"));
    return out;
  }

  /**
   * A syntax error's message and position are the YAML parser's — not normative — so only its code
   * is compared.
   */
  static JsonNode normalized(ObjectNode report) {
    for (var list : List.of("errors", "warnings")) {
      for (var issue : report.withArray(list)) {
        if ("yaml_syntax".equals(issue.path("code").asText())) {
          ((ObjectNode) issue).remove(List.of("message", "line", "column"));
        }
      }
    }
    return report;
  }

  static ValidationContext contextOf(JsonNode c) {
    if (c == null || c.isNull()) {
      return ValidationContext.none();
    }
    return ValidationContext.of(
        names(c.get("sources")),
        names(c.get("partials")),
        names(c.get("components")),
        names(c.get("actions")),
        names(c.get("fieldTypes")));
  }

  private static List<String> names(JsonNode list) {
    if (list == null || !(list instanceof ArrayNode)) return null;
    var out = new ArrayList<String>();
    list.forEach(n -> out.add(n.asText()));
    return out;
  }
}
