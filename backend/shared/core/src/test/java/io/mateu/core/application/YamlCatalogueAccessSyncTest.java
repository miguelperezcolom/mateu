package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * {@code access:} on an entry of the shared action catalogue is enforced exactly like {@code
 * access:} on a page's own action: a caller who does not satisfy it is not shipped the entry, and a
 * call that reaches the server anyway — dispatched, or proxied through {@code __restfetch__} — is
 * refused with 403.
 */
class YamlCatalogueAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private Path specs() {
    return SpecsDir.write(
        dir,
        Map.of(
            "app.ui.yaml",
            """
            type: UI
            basePath: /
            routes:
              - routes.yaml
            """,
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: invoices
                layout: invoices.yaml
            """,
            "actions.yaml",
            """
            type: Actions
            actions:
              - id: voidInvoice
                access: {roles: [accountant]}
                restAction:
                  source: {url: https://api.invalid/invoices/void, method: POST}
              - id: printInvoice
                steps:
                  - type: Emit
                    event: print
            """,
            "invoices.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: Button
                  label: Void
                  actionId: voidInvoice
                - type: Button
                  label: Print
                  actionId: printInvoice
                - type: Button
                  label: Archive
                  actionId: archive
            actions:
              - id: archive
                access: {roles: [manager]}
                restAction:
                  source: {url: https://api.invalid/invoices/archive, method: POST}
            """));
  }

  private static JsonNode load(Path root, Map<String, String> headers) {
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            return JSON.valueToTree(
                mateu.run(
                    RunActionRqDto.builder().route("/invoices").actionId("").build(), headers));
          }
        });
  }

  private static Throwable refusal(Path root, RunActionRqDto rq, Map<String, String> headers) {
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            mateu.run(rq, headers);
            return null;
          } catch (Throwable t) {
            return t;
          }
        });
  }

  private static JsonNode button(JsonNode wire, String actionId) {
    for (var node : wire.findParents("actionId")) {
      if ("Button".equals(node.path("type").asText())
          && actionId.equals(node.path("actionId").asText())) {
        return node;
      }
    }
    throw new AssertionError("no button " + actionId + " in " + wire);
  }

  @Test
  void aRestrictedCatalogueActionIsDisabledForACallerWhoDoesNotSatisfyIt() {
    var root = specs();
    var anonymous = load(root, Map.of());
    assertThat(button(anonymous, "voidInvoice").path("disabled").asBoolean()).isTrue();
    assertThat(button(anonymous, "printInvoice").path("disabled").asBoolean()).isFalse();
    // it runs in the browser, so not shipping it IS the enforcement
    assertThat(anonymous.toString()).doesNotContain("invoices/void").contains("\"print\"");

    var accountant = load(root, TestIdentities.headersWithRoles("accountant"));
    assertThat(button(accountant, "voidInvoice").path("disabled").asBoolean()).isFalse();
    assertThat(accountant.toString()).contains("invoices/void");
  }

  @Test
  void aRestrictedCatalogueActionCalledAnywayIsRefused() {
    var root = specs();
    var rq = RunActionRqDto.builder().route("/invoices").actionId("voidInvoice").build();
    assertThat(refusal(root, rq, Map.of())).isInstanceOf(MateuForbiddenException.class);
  }

  @Test
  void aRestrictedActionProxiedThroughTheRestFetchIsRefused() {
    var root = specs();
    var proxied =
        RunActionRqDto.builder()
            .route("/invoices")
            .actionId("__restfetch__")
            .parameters(Map.of("_sourceId", "archive"))
            .build();
    assertThat(refusal(root, proxied, TestIdentities.headersWithRoles("clerk")))
        .isInstanceOf(MateuForbiddenException.class)
        .hasMessageContaining("archive");
  }
}
