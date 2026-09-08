package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A proxied call that fails upstream must SURFACE the failure, not swallow it. The server used to
 * catch any 4xx/5xx or transport error and answer an empty {@code _restfetch} body — which the
 * renderer read as success, toasted "Saved"/"Deleted" and navigated over a write that never
 * happened. Now a failure rides back on {@code _restfetchError} instead, and the renderer shows an
 * error toast without merging or navigating.
 *
 * <p>The endpoint here points at a closed local port, so every call fails at connect (a transport
 * error, status 0) with no live server needed.
 */
class RestProxyErrorSyncTest {

  @SuppressWarnings("unused")
  @UI("/proxyfail")
  @Title("Proxy fail")
  public static class ProxyFailForm {
    // 127.0.0.1:1 is refused immediately — a deterministic transport failure.
    @RestAction(url = "http://127.0.0.1:1/people/${state.id}", method = "DELETE", proxy = true)
    public void remove() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProxyFailForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aFailedProxyCallSurfacesAnErrorInsteadOfAnEmptyBody() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/proxyfail")
                .actionId("__restfetch__")
                .parameters(Map.of("_sourceKind", "action", "_sourceId", "remove"))
                .componentState(Map.of("id", 7))
                .build());
    assertThat((Map<String, Object>) increment.appData())
        .as("the failure is on _restfetchError, not on _restfetch")
        .containsKey("_restfetchError")
        .doesNotContainKey("_restfetch");
  }

  @Test
  void aBulkProxyCallReportsHowManyRowsFailed() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/proxyfail")
                .actionId("__restfetch__")
                .parameters(
                    Map.of(
                        "_sourceKind",
                        "action",
                        "_sourceId",
                        "remove",
                        "_forEachSelectedRow",
                        true))
                .componentState(
                    Map.of("crud_selected_items", List.of(Map.of("id", 1), Map.of("id", 2))))
                .build());
    @SuppressWarnings("unchecked")
    var error =
        (Map<String, Object>) ((Map<String, Object>) increment.appData()).get("_restfetchError");
    assertThat(error).as("both rows failed, so the bulk call surfaces an error").isNotNull();
    assertThat(String.valueOf(error.get("message"))).contains("2 of 2 failed");
  }
}
