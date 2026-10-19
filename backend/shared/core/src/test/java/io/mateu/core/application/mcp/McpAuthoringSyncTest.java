package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.authoring.SpecWriter;
import io.mateu.core.infra.dev.DevMode;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The authoring half of the MCP plane over the real core: the resources, the validation reaching
 * the app's loader, the preview, and {@code mateu_save_spec} — only in development mode, only
 * inside the specs directory.
 */
class McpAuthoringSyncTest {

  private static final ObjectMapper OM = new ObjectMapper();

  @UI("/mcp-authoring")
  @Title("Authoring")
  public static class Home {}

  static TestMateu mateu;
  static McpEndpoint endpoint;
  static McpService mcp;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Home.class);
    endpoint = new McpEndpoint(mateu.service());
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @AfterEach
  void devModeOff() {
    DevMode.reset();
  }

  private static JsonNode rpc(String json) throws Exception {
    var answer = endpoint.handle(json, FakeHttpRequest::new);
    return answer == null ? null : OM.readTree(answer);
  }

  private static JsonNode call(String tool, ObjectNode args) throws Exception {
    var msg = OM.createObjectNode().put("jsonrpc", "2.0").put("id", 9).put("method", "tools/call");
    msg.putObject("params").put("name", tool).set("arguments", args);
    return rpc(msg.toString()).get("result");
  }

  private static JsonNode payload(JsonNode result) throws Exception {
    assertThat(result.has("isError")).as(result.toString()).isFalse();
    return OM.readTree(result.get("content").get(0).get("text").asText());
  }

  @Test
  void aBodyThatIsNotJsonIsAParseErrorNotAFailure() throws Exception {
    var answer = rpc("{not json");
    assertThat(answer.get("error").get("code").asInt()).isEqualTo(-32700);
    assertThat(answer.get("id").isNull()).isTrue();
    assertThat(rpc("[1,2]").get("error").get("code").asInt()).isEqualTo(-32600);
  }

  @Test
  void initializeAdvertisesToolsAndResources() throws Exception {
    var result = rpc("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}").get("result");
    assertThat(result.get("capabilities").has("tools")).isTrue();
    assertThat(result.get("capabilities").has("resources")).isTrue();
    assertThat(result.get("protocolVersion").asText()).isEqualTo("2024-11-05");
  }

  @Test
  void everyResourceReadsBackFromTheJar() throws Exception {
    var list = rpc("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"resources/list\"}");
    for (var r : list.get("result").get("resources")) {
      var read =
          rpc(
              "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"resources/read\",\"params\":{\"uri\":\""
                  + r.get("uri").asText()
                  + "\"}}");
      var content = read.get("result").get("contents").get(0);
      assertThat(content.get("uri").asText()).isEqualTo(r.get("uri").asText());
      assertThat(content.get("text").asText()).isNotBlank();
    }
    var missing =
        rpc(
            "{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"resources/read\",\"params\":{\"uri\":"
                + "\"mateu://nope\"}}");
    assertThat(missing.get("error").get("code").asInt()).isEqualTo(-32002);
    var noUri = rpc("{\"jsonrpc\":\"2.0\",\"id\":4,\"method\":\"resources/read\"}");
    assertThat(noUri.get("error").get("code").asInt()).isEqualTo(-32602);
  }

  @Test
  void validationGoesThroughTheAppAndReportsEveryError() throws Exception {
    var report =
        payload(
            call(
                "mateu_validate_uidl",
                OM.createObjectNode()
                    .put("yaml", "type: FormField\nid: price\ndataType: decimal\nrequired: x\n")));
    assertThat(report.get("valid").asBoolean()).isFalse();
    assertThat(report.get("errors")).hasSize(2);
    assertThat(report.get("errors").get(0).get("line").asInt()).isEqualTo(3);
  }

  @Test
  void aStructurallyValidPageTheLoaderCannotBuildIsNotValid() {
    // whatever the structural pass cannot see, the real loader is asked about
    var failing =
        new io.mateu.core.application.runaction.YamlUidlLoader() {
          @Override
          public ParsedText parseTextReporting(String yaml) {
            return new ParsedText(null, "line 2 (text): broken");
          }
        };
    var service =
        new io.mateu.core.application.authoring.UidlValidationService(
            new io.mateu.core.application.runaction.RestSourceRegistry(),
            new io.mateu.core.application.runaction.ActionRegistry(),
            new io.mateu.core.application.runaction.ComponentRegistry(),
            new io.mateu.core.application.runaction.FieldTypeRegistry(),
            failing);
    var report = service.validate("type: Text\ntext: hi\n");
    assertThat(report.get("valid").asBoolean()).isFalse();
    assertThat(report.get("errors").get(0).get("code").asText()).isEqualTo("load_failed");
    assertThat(report.get("errors").get(0).get("message").asText())
        .isEqualTo("The definition could not be loaded: line 2 (text): broken");
    assertThat(
            mcp.validate("type: Text\ntext: hi\n", "", FakeHttpRequest::new)
                .get("valid")
                .asBoolean())
        .isTrue();
  }

  @Test
  void aMissingArgumentIsTheCallersMistake() throws Exception {
    var result = call("mateu_validate_uidl", OM.createObjectNode());
    assertThat(result.get("isError").asBoolean()).isTrue();
    assertThat(result.get("content").get(0).get("text").asText())
        .isEqualTo("Error: Missing argument \"yaml\".");
  }

  @Test
  void aPreviewRendersThePageAndAnInvalidOneIsNotRendered() throws Exception {
    var ok =
        payload(
            call(
                "mateu_preview_uidl",
                OM.createObjectNode()
                    .put(
                        "yaml",
                        "type: FormLayout\ncontent:\n  - type: FormField\n    id: city\n"
                            + "    label: City\n    dataType: string\n")));
    assertThat(ok.get("rendered").asBoolean()).isTrue();
    assertThat(ok.get("screen").get("fields").get(0).get("id").asText()).isEqualTo("city");

    var bad =
        payload(call("mateu_preview_uidl", OM.createObjectNode().put("yaml", "type: Nope\n")));
    assertThat(bad.get("rendered").asBoolean()).isFalse();
    assertThat(bad.has("screen")).isFalse();

    var routes =
        payload(
            call(
                "mateu_preview_uidl",
                OM.createObjectNode().put("yaml", "type: Routes\nroutes: []\n")));
    assertThat(routes.get("rendered").asBoolean()).isFalse();
    assertThat(routes.get("reason").asText()).contains("Only a page");
  }

  @Test
  void saveSpecIsNeitherListedNorCallableOutsideDevelopmentMode() throws Exception {
    DevMode.disable();
    var list = rpc("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}");
    assertThat(list.toString()).doesNotContain("mateu_save_spec");
    var result =
        call(
            "mateu_save_spec",
            OM.createObjectNode().put("path", "x.yaml").put("yaml", "type: Text\ntext: a\n"));
    assertThat(result.get("isError").asBoolean()).isTrue();
    assertThat(result.get("content").get(0).get("text").asText())
        .isEqualTo("Error: Unknown tool: mateu_save_spec");
  }

  @Test
  void saveSpecWritesInsideTheSpecsDirectoryInDevelopmentMode(@TempDir Path specs)
      throws Exception {
    DevMode.enable(specs.toString());
    var list = rpc("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}");
    assertThat(list.toString()).contains("mateu_save_spec");

    var saved =
        payload(
            call(
                "mateu_save_spec",
                OM.createObjectNode()
                    .put("path", "partials/hello.yaml")
                    .put("yaml", "type: Text\ntext: hello\n")));
    assertThat(saved.get("saved").asBoolean()).isTrue();
    assertThat(Files.readString(specs.resolve("partials/hello.yaml")))
        .isEqualTo("type: Text\ntext: hello\n");

    var invalid =
        payload(
            call(
                "mateu_save_spec",
                OM.createObjectNode().put("path", "bad.yaml").put("yaml", "type: Nope\n")));
    assertThat(invalid.get("saved").asBoolean()).isFalse();
    assertThat(Files.exists(specs.resolve("bad.yaml"))).isFalse();

    for (var path :
        new String[] {"../escape.yaml", "/etc/x.yaml", "a/./b.yaml", "x.txt", "a\\b.yaml"}) {
      var refused =
          call(
              "mateu_save_spec",
              OM.createObjectNode().put("path", path).put("yaml", "type: Text\ntext: a\n"));
      assertThat(refused.get("isError").asBoolean()).as(path).isTrue();
      assertThat(refused.get("content").get(0).get("text").asText())
          .startsWith("Error: Invalid path");
    }
    assertThat(Files.exists(specs.getParent().resolve("escape.yaml"))).isFalse();
  }

  @Test
  void aSymlinkOutOfTheSpecsDirectoryIsRefused(@TempDir Path root) throws Exception {
    var specs = Files.createDirectories(root.resolve("specs"));
    var outside = Files.createDirectories(root.resolve("outside"));
    Files.createSymbolicLink(specs.resolve("link"), outside);
    assertThat(SpecWriter.isAcceptable("link/x.yaml")).isTrue();
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () -> SpecWriter.write(specs, "link/x.yaml", "type: Text\n"))
        .isInstanceOf(io.mateu.uidl.UserFacingException.class);
    assertThat(Files.exists(outside.resolve("x.yaml"))).isFalse();
  }

  @Test
  void anUnexpectedFailureShowsAReferenceNotTheException() {
    var text = McpJsonRpc.errorText(new IllegalStateException("SELECT * FROM secrets"), null);
    assertThat(text).startsWith("An unexpected error occurred. Reference: ");
    assertThat(text).doesNotContain("SELECT");
  }
}
