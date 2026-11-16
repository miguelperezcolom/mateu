package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Independent re-verification (rc.1) of GA round-2 J1 — route spellings — written from the review's
 * scenarios (design/ga-review-2), not from the fix commits' own tests. Shapes the fix tests did not
 * exercise are the point: other spellings, other ways in, other types.
 */
class Rc1ReverifyYamlRoutesSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  // ── J1: route spellings ────────────────────────────────────────────────────────────────

  @TempDir Path dir;

  static String page(String text) {
    return """
        layout:
          type: VerticalLayout
          content:
            - type: Text
              text: "%s"
        actions:
          - id: purge
            restAction:
              source:
                url: https://api.invalid/purge
                method: DELETE
                proxy: true
        """
        .formatted(text);
  }

  private Path j1Specs() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: admin
                layout: admin.yaml
                access: admin
              - route: backoffice/users/:id
                layout: pages/user.yaml
                access: admin
            """,
            "admin.yaml",
            page("ADMIN-PAGE"),
            "pages/user.yaml",
            page("USER-PAGE")));
  }

  private String outcome(Path root, String route, String type, String actionId) {
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .serverSideType(type)
            .actionId(actionId)
            .parameters(
                "__restfetch__".equals(actionId)
                    ? Map.of("_sourceKind", "action", "_sourceId", "purge")
                    : Map.of())
            .build();
    return SpecsDir.over(
        root,
        cl -> {
          try (var m = TestMateu.withUis()) {
            try {
              return JSON.valueToTree(m.run(rq, Map.of())).toString();
            } catch (MateuForbiddenException e) {
              return "FORBIDDEN";
            } catch (Throwable t) {
              return "THROWN " + t;
            }
          }
        });
  }

  @Test
  void j1_moreSpellingsOfTheRestrictedDefinitionsAreNotServed() {
    var root = j1Specs();
    for (var route :
        List.of(
            "/pages//user",
            "//pages/user",
            "/PAGES/USER",
            "/pages/user/",
            "/Admin",
            "/ADMIN",
            "/hello/%2E%2E/admin",
            "/./admin")) {
      for (var type : new String[] {null, "", "io.mateu.Nope"}) {
        assertThat(outcome(root, route, type, ""))
            .as(route + " type=" + type)
            .doesNotContain("ADMIN-PAGE")
            .doesNotContain("USER-PAGE");
        // refused, or nothing answers the route at all (no page, so no proxied call)
        assertThat(outcome(root, route, type, "__restfetch__"))
            .as("restfetch " + route + " type=" + type)
            .matches(
                "FORBIDDEN|THROWN java.lang.AssertionError: runAction produced no increment.*");
      }
    }
  }
}
