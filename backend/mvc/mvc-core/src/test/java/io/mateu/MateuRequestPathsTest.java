package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * The servlet request's path WITHIN the application (what Mateu's filters compare), its public
 * prefix, and the CORS filter built the pre-paths way.
 */
class MateuRequestPathsTest {

  private static MockHttpServletRequest request(String contextPath, String uri) {
    var request = new MockHttpServletRequest("GET", uri);
    request.setContextPath(contextPath);
    return request;
  }

  @Test
  void thePathWithinTheAppDropsTheContextPath() {
    assertThat(MateuRequestPaths.withinApp(request("/ctx", "/ctx/admin/orders")))
        .isEqualTo("/admin/orders");
    assertThat(MateuRequestPaths.withinApp(request("/ctx", "/ctx"))).isEqualTo("/");
    assertThat(MateuRequestPaths.withinApp(request("", "/admin"))).isEqualTo("/admin");
    assertThat(MateuRequestPaths.withinApp(request("/ctx", "/other"))).isEqualTo("/other");
    var noUri = request(null, null);
    noUri.setRequestURI(null);
    assertThat(MateuRequestPaths.withinApp(noUri)).isEqualTo("/");
  }

  @Test
  void thePrefixIsTheContextPathUnlessAProxyIsTrusted() {
    var request = request("/ctx", "/ctx/admin");
    request.addHeader("X-Forwarded-Prefix", "/proxied");
    assertThat(MateuRequestPaths.prefixOf(request)).isEqualTo("/ctx");
  }

  @Test
  @SuppressWarnings("removal")
  void theTwoArgumentCorsFilterStillWorks() throws Exception {
    var filter = new MateuCorsFilter("https://shell.example", "false");
    var request = request("", "/mateu/v3/sync/x");
    request.addHeader("Origin", "https://shell.example");
    var response = new MockHttpServletResponse();
    filter.doFilter(request, response, (rq, rs) -> {});
    assertThat(response.getHeader("Access-Control-Allow-Origin"))
        .isEqualTo("https://shell.example");
  }
}
