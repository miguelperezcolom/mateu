package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The static-safety check over a whole manifest: a route the exporter could not bundle is itself a
 * violation (it would need a backend), a view that handles actions in Java needs a server, a bare
 * {@code proxy: true} source needs one too, and repeated findings are reported once.
 */
class StaticSafetyManifestTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  public static class JavaHandled implements ActionHandler {
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
      return null;
    }
  }

  @Test
  void anUnbundledRouteAndAJavaActionHandlerAreReportedOncePerReason() {
    var manifest =
        new BundleManifest(
            "",
            "now",
            true,
            List.of(
                new BundleEntry("/needs-db", "needs-db", null, false, "the database is down"),
                new BundleEntry("/handled", "handled", "{\"fragments\":[]}", true, null)));
    var violations =
        StaticSafetyCheck.check(
            manifest,
            Map.of("handled", JavaHandled.class.getName(), "needs-db", "com.nowhere.Missing"),
            getClass().getClassLoader());
    assertThat(violations)
        .extracting(StaticSafetyCheck.Violation::toString)
        .containsExactly(
            "/needs-db — could not be bundled, so it would be served by a backend: the database"
                + " is down",
            "/handled — JavaHandled handles actions in Java (ActionHandler)");
  }

  @Test
  void aBareProxiedSourceNeedsTheServer() throws Exception {
    var source = JSON.readTree("{\"proxy\": true}");
    assertThat(StaticSafetyCheck.checkSource("/x", source, RestSourceCatalog.empty(), "a source"))
        .extracting(StaticSafetyCheck.Violation::reason)
        .containsExactly("a source is fetched through the server proxy (proxy: true)");
    // a reference the catalogue does not carry says nothing about where it is fetched
    assertThat(
            StaticSafetyCheck.checkSource(
                "/x",
                JSON.readTree("{\"ref\": \"unknown\"}"),
                RestSourceCatalog.empty(),
                "a source"))
        .isEmpty();
  }

  @Test
  void aClientFlowIsOnlyOneWithStepsAndNoServerRoundTrip() throws Exception {
    assertThat(StaticSafetyCheck.isClientFlow(JSON.readTree("{\"steps\": []}"))).isFalse();
    assertThat(
            StaticSafetyCheck.isClientFlow(
                JSON.readTree(
                    "{\"steps\": [{\"type\": \"Navigate\"}, {\"type\": \"RunAction\"}]}")))
        .isFalse();
    assertThat(
            StaticSafetyCheck.isClientFlow(
                JSON.readTree("{\"steps\": [{\"type\": \"Navigate\", \"route\": \"x\"}]}")))
        .isTrue();
  }
}
