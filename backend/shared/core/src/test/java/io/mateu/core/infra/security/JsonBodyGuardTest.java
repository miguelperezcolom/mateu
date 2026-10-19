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
}
