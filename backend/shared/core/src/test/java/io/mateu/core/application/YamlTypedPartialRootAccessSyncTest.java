package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A partial whose ROOT is a typed component with a {@code content:} list IS that component — its
 * access keys, id and style included. Only a type-less {@code content:} document (the "several
 * components" shape) is spliced into the page. Unwrapping a typed root used to drop the container
 * and its {@code eyesOnly}, so a guarded card in a partial reached every caller.
 */
class YamlTypedPartialRootAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  /** The reported shape, verbatim. */
  static final String REPORTED_PARTIAL =
      """
      type: Card
      title: Secret
      eyesOnly: ADMIN
      content:
        - type: Text
          text: confidential
      """;

  /** The same defect on a container whose list {@code content:} is valid for its type. */
  static final String GUARDED_LAYOUT_PARTIAL =
      """
      type: VerticalLayout
      id: vault-box
      style: "gap: 1rem"
      eyesOnly: ADMIN
      content:
        - type: Text
          text: Secret
        - type: Text
          text: confidential
      """;

  /** A {@code type: Partial} headed document guarding everything it holds. */
  static final String GUARDED_PARTIAL_DOCUMENT =
      """
      type: Partial
      eyesOnly: ADMIN
      content:
        - type: Text
          text: confidential
      """;

  /** A type-less document guarding everything it holds. */
  static final String GUARDED_TYPELESS_DOCUMENT =
      """
      eyesOnly: ADMIN
      content:
        - type: Text
          text: confidential
      """;

  static final String PLAIN_DOCUMENT =
      """
      content:
        - type: Text
          text: confidential
      """;

  static final String PLAIN_REF = "{type: Partial, ref: secret-card}";

  static final String GUARDED_REF = "{type: Partial, ref: secret-card, eyesOnly: ADMIN}";

  @TempDir Path dir;

  private String load(String partial, Map<String, String> headers) {
    return load(partial, PLAIN_REF, headers);
  }

  private String load(String partial, String ref, Map<String, String> headers) {
    io.mateu.core.application.runaction.PartialRegistry.instance().reset();
    var specs =
        SpecsDir.write(
            dir,
            Map.of(
                "routes.yaml",
                """
                type: Routes
                routes:
                  - route: vault
                    layout: vault.yaml
                """,
                "vault.yaml",
                """
                layout:
                  type: VerticalLayout
                  content:
                    - type: Text
                      text: "Public text"
                    - %s
                """
                    .formatted(ref),
                "partials/secret-card.yaml",
                partial));
    return SpecsDir.over(
        specs,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            var rq = RunActionRqDto.builder().route("/vault").actionId("").build();
            return JSON.valueToTree(mateu.run(rq, headers)).toString();
          }
        });
  }

  private static List<JsonNode> nodes(String wire, String field, String value) {
    var found = new ArrayList<JsonNode>();
    try {
      collect(JSON.readTree(wire), field, value, found);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
    return found;
  }

  private static void collect(JsonNode node, String field, String value, List<JsonNode> out) {
    if (node.isObject()) {
      if (node.has(field) && value.equals(node.get(field).asText())) {
        out.add(node);
      }
      node.forEach(child -> collect(child, field, value, out));
    } else if (node.isArray()) {
      node.forEach(child -> collect(child, field, value, out));
    }
  }

  /**
   * The reported shape used to be dissolved into its children, so the unguarded Text reached every
   * caller. Kept whole, it is a Card whose {@code title}/{@code content} are not valid Card slots
   * (both take ONE component), and Java's loader refuses the definition — the page fails closed
   * ("Page not found"). Either way, "confidential" must never reach a caller without the role.
   */
  @Test
  void theReportedGuardedCardNeverReachesACallerWithoutTheRole() {
    var guest = load(REPORTED_PARTIAL, Map.of());
    assertThat(guest).doesNotContain("confidential");
    assertThat(nodes(guest, "type", "Card")).isEmpty();
  }

  @Test
  void aGuardedTypedRootIsRemovedForACallerWithoutTheRole() {
    var guest = load(GUARDED_LAYOUT_PARTIAL, Map.of());
    assertThat(guest)
        .contains("Public text")
        .doesNotContain("confidential")
        .doesNotContain("vault-box");
  }

  @Test
  void aGuardedTypedRootKeepsItsMetadataForACallerWithTheRole() {
    var admin = load(GUARDED_LAYOUT_PARTIAL, TestIdentities.headersWithRoles("ADMIN"));
    assertThat(admin).contains("confidential");
    var boxes = nodes(admin, "id", "vault-box");
    assertThat(boxes).isNotEmpty();
    assertThat(boxes.get(0).path("style").asText()).isEqualTo("gap: 1rem");
  }

  @Test
  void aPartialDocumentsOwnAccessKeysGuardWhatItHolds() {
    for (var partial : List.of(GUARDED_PARTIAL_DOCUMENT, GUARDED_TYPELESS_DOCUMENT)) {
      assertThat(load(partial, Map.of())).contains("Public text").doesNotContain("confidential");
      assertThat(load(partial, TestIdentities.headersWithRoles("ADMIN"))).contains("confidential");
    }
  }

  @Test
  void theAccessKeysOfThePartialReferenceGuardWhatItStandsFor() {
    for (var partial : List.of(PLAIN_DOCUMENT, "type: Text\ntext: confidential\n")) {
      assertThat(load(partial, GUARDED_REF, Map.of()))
          .contains("Public text")
          .doesNotContain("confidential");
      assertThat(load(partial, GUARDED_REF, TestIdentities.headersWithRoles("ADMIN")))
          .contains("confidential");
    }
  }
}
