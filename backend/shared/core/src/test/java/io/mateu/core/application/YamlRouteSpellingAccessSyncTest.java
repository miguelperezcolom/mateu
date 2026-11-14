package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A route's {@code access:} holds for its DEFINITION, whatever spelling of the request reaches it
 * (GA review round 2, J1). Before: the access check matched the route as sent, while a route no
 * authored entry answers was served by convention from {@code specs/ui/<route>.yaml} — so the
 * layout file's own path ({@code /pages/user} for {@code backoffice/users/:id}), a dot segment
 * ({@code /hello/../admin}, {@code /./admin}) or a case variant ({@code /Admin}, on a
 * case-insensitive file system) served the page, and proxied its server-held calls, to anyone.
 */
class YamlRouteSpellingAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private static String page(String text) {
    return """
        layout:
          type: VerticalLayout
          content:
            - type: Text
              text: "%s"
            - type: Button
              label: Purge
              actionId: purge
        actions:
          - id: purge
            restAction:
              source:
                url: https://api.invalid/purge
                method: DELETE
                proxy: true
                headers:
                  X-Api-Key: ${secret.PURGE_KEY}
        """
        .formatted(text);
  }

  private Path specs() {
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
              - route: hello
                layout: hello.yaml
            """,
            "admin.yaml",
            page("ADMIN-PAGE"),
            "pages/user.yaml",
            page("USER-PAGE"),
            "hello.yaml",
            page("HELLO-PAGE")));
  }

  /** What the caller gets: "FORBIDDEN", or the wire answer as text. */
  private String outcome(Path root, String route, String actionId, String... roles) {
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .parameters(
                "__restfetch__".equals(actionId)
                    ? Map.of("_sourceKind", "action", "_sourceId", "purge")
                    : Map.of())
            .build();
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            try {
              return JSON.valueToTree(
                      mateu.run(
                          rq,
                          roles.length == 0 ? Map.of() : TestIdentities.headersWithRoles(roles)))
                  .toString();
            } catch (MateuForbiddenException e) {
              return "FORBIDDEN";
            } catch (Throwable t) {
              return "THROWN " + t;
            }
          }
        });
  }

  private static final List<String> OTHER_SPELLINGS =
      List.of(
          "/pages/user",
          "/hello/../admin",
          "/./admin",
          "/hello/%2e%2e/admin",
          "/Admin",
          "/hello/../../../specs/ui/admin",
          "/hello/..\\admin");

  @Test
  void theAuthoredSpellingIsRefused() {
    var root = specs();
    assertThat(outcome(root, "/admin", "")).isEqualTo("FORBIDDEN");
    assertThat(outcome(root, "/backoffice/users/7", "")).isEqualTo("FORBIDDEN");
    assertThat(outcome(root, "/hello", "")).contains("HELLO-PAGE");
  }

  @Test
  void noOtherSpellingServesTheRestrictedDefinition() {
    var root = specs();
    for (var route : OTHER_SPELLINGS) {
      var load = outcome(root, route, "");
      assertThat(load).as(route).doesNotContain("ADMIN-PAGE").doesNotContain("USER-PAGE");
    }
  }

  @Test
  void noOtherSpellingProxiesTheRestrictedPagesCalls() {
    var root = specs();
    assertThat(outcome(root, "/admin", "__restfetch__")).isEqualTo("FORBIDDEN");
    for (var route : OTHER_SPELLINGS) {
      assertThat(outcome(root, route, "__restfetch__")).as(route).isEqualTo("FORBIDDEN");
    }
  }

  @Test
  void theLayoutFilesPathIsRefusedEvenWhenTheAuthoredRouteHasParameters() {
    var root = specs();
    assertThat(outcome(root, "/pages/user", "")).isEqualTo("FORBIDDEN");
    // an admin reaches the definition at its file's path as at its route
    assertThat(outcome(root, "/pages/user", "", "admin")).contains("USER-PAGE");
  }
}
