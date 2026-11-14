package io.mateu.demo.signin;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

/** Which requests need a signed-in user: Mateu's calls, never the files it reads at boot. */
class SecurityConfigTest {

  private static boolean needsSignIn(String method, String uri) {
    return SecurityConfig.MATEU_CALLS.matches(new MockHttpServletRequest(method, uri));
  }

  @Test
  void mateuCallsNeedASignedInUser() {
    assertThat(needsSignIn("POST", "/mateu/v3/sync/orders")).isTrue();
    assertThat(needsSignIn("POST", "/mateu/v3/sse/orders")).isTrue();
    assertThat(needsSignIn("POST", "/mateu/v3/upload")).isTrue();
  }

  @Test
  void thePwaFilesAndTheUiManifestStayPublic() {
    assertThat(needsSignIn("GET", "/mateu/v3/pwa/register.js")).isFalse();
    assertThat(needsSignIn("GET", "/mateu/v3/pwa/manifest.webmanifest")).isFalse();
    assertThat(needsSignIn("GET", "/mateu/v3/pwa/sw.js")).isFalse();
    assertThat(needsSignIn("GET", "/mateu/v3/manifest")).isFalse();
    assertThat(needsSignIn("GET", "/assets/index.js")).isFalse();
    assertThat(needsSignIn("GET", "/")).isFalse();
  }
}
