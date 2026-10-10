package io.mateu.core.infra.out;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/** The url a remote Mateu app is called at cannot be moved by the route appended to it. */
class DefaultMateuHttpClientTargetTest {

  @AfterEach
  void clear() {
    System.clearProperty(RemoteTargets.ALLOWED_HOSTS);
    System.clearProperty("mateu.remote.timeout-seconds");
  }

  @Test
  void aRouteStaysUnderTheRemoteSyncEndpoint() {
    assertThat(DefaultMateuHttpClient.constrainedTarget("http://h:8080/_forms", "/tasks/1"))
        .hasToString("http://h:8080/_forms/mateu/v3/sync/tasks/1");
    assertThat(DefaultMateuHttpClient.constrainedTarget("https://h/", "/x"))
        .hasToString("https://h/mateu/v3/sync/x");
  }

  @Test
  void aRouteCannotTraverseOutOfIt() {
    assertThatThrownBy(
            () -> DefaultMateuHttpClient.constrainedTarget("http://h/_forms", "/../../../admin"))
        .isInstanceOf(IllegalArgumentException.class);
    // an @ in the route is a path character, never user info that changes the host
    assertThat(
            DefaultMateuHttpClient.constrainedTarget("http://h/_forms", "/x@evil.com/y").getHost())
        .isEqualTo("h");
  }

  @Test
  void theAllowListIsEnforcedAtTheClient() {
    System.setProperty(RemoteTargets.ALLOWED_HOSTS, "forms.acme.com");
    assertThat(DefaultMateuHttpClient.constrainedTarget("https://forms.acme.com", "/x"))
        .isNotNull();
    assertThatThrownBy(() -> DefaultMateuHttpClient.constrainedTarget("http://10.0.0.1", "/x"))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void theRequestTimeoutIsConfigurable() {
    assertThat(DefaultMateuHttpClient.requestTimeout()).isEqualTo(Duration.ofSeconds(30));
    System.setProperty("mateu.remote.timeout-seconds", "5");
    assertThat(DefaultMateuHttpClient.requestTimeout()).isEqualTo(Duration.ofSeconds(5));
  }
}
