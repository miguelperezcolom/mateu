package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JsonBodyGuardTest {

  @Test
  void refusesEveryCorsSimpleBodyOnTheActionEndpoints() {
    for (String path :
        new String[] {
          "/mateu/v3/sync/_no_route",
          "/orders/mateu/v3/sync/x/y",
          "/orders/mateu/v3/sse/_no_route",
          "/mateu/mcp",
          "/mateu/mcp/",
          "/mateu/mcp?x=1"
        }) {
      for (String contentType :
          new String[] {
            "text/plain",
            "text/plain;charset=UTF-8",
            "application/x-www-form-urlencoded",
            "multipart/form-data; boundary=x",
            null,
            ""
          }) {
        assertThat(JsonBodyGuard.refuses("POST", path, contentType))
            .as(path + " " + contentType)
            .isTrue();
      }
    }
  }

  @Test
  void letsJsonThrough() {
    assertThat(JsonBodyGuard.refuses("POST", "/mateu/v3/sync/x", "application/json")).isFalse();
    assertThat(JsonBodyGuard.refuses("POST", "/mateu/mcp", "Application/JSON; charset=utf-8"))
        .isFalse();
    assertThat(JsonBodyGuard.refuses("POST", "/a/mateu/v3/sse/x", "application/vnd.x+json"))
        .isFalse();
  }

  @Test
  void leavesEverythingElseAlone() {
    assertThat(JsonBodyGuard.refuses("GET", "/mateu/v3/manifest", null)).isFalse();
    assertThat(JsonBodyGuard.refuses("OPTIONS", "/mateu/v3/sync/x", null)).isFalse();
    assertThat(JsonBodyGuard.refuses("POST", "/mateu/v3/client-log", "text/plain")).isFalse();
    assertThat(JsonBodyGuard.refuses("POST", "/mateu/dev/reload", "text/plain")).isFalse();
    assertThat(JsonBodyGuard.refuses("POST", "/login", "application/x-www-form-urlencoded"))
        .isFalse();
    assertThat(JsonBodyGuard.refuses("POST", "/mateu/mcpx", "text/plain")).isFalse();
  }

  @Test
  void refusesThePathSpellingsTheFrameworksStillRouteToTheSameHandler() {
    for (String path :
        new String[] {
          "/%6Dateu/mcp",
          "/%6dateu/%6Dcp",
          "/%256Dateu/mcp",
          "/mateu/mcp;x=1",
          "/mateu;a=b/mcp",
          "//mateu//mcp",
          "/mateu/mcp//",
          "/MATEU/MCP",
          "/x/../mateu/mcp",
          "/./mateu/./mcp",
          "\\mateu\\mcp",
          "/yaml-mixed/%6Dateu/v3/sync/_",
          "/hello/mateu/%76%33/sync/x",
          "/hello/mateu/v3;x=1/sse/x",
          "/mateu/v3/client-log/../sync/x",
          "/mateu/v3/client-log;x/../sync/x"
        }) {
      assertThat(JsonBodyGuard.refuses("POST", path, "text/plain")).as(path).isTrue();
      assertThat(JsonBodyGuard.refuses("POST", path, null)).as(path).isTrue();
    }
  }

  @Test
  void theCanonicalFormDecodesAndDropsSegmentParametersAndDotSegments() {
    assertThat(JsonBodyGuard.canonicalPath("/%6Dateu/mcp;x=1?q=1")).isEqualTo("/mateu/mcp");
    assertThat(JsonBodyGuard.canonicalPath("//a/./b/../c/")).isEqualTo("/a/c");
    assertThat(JsonBodyGuard.canonicalPath("/%zz/x")).isEqualTo("/%zz/x");
    assertThat(JsonBodyGuard.canonicalPath("/../../x")).isEqualTo("/x");
  }
}
