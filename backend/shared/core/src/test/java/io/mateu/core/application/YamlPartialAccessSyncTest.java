package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A {@code type: Partial} pulled in by {@code ref:} behaves exactly like the same content written
 * inline: its access keys ({@code eyesOnly:}, {@code readOnlyUnless:}) and {@code ${i18n.…}}
 * expressions are applied on the server for the caller. They used to be dropped when the partial
 * was built — so a guarded section reached every caller once it lived in a partial, and its texts
 * stayed raw.
 */
class YamlPartialAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private Path fixture() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: staff
                layout: staff.yaml
            """,
            "staff.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: Text
                  text: "Public text"
                - type: Partial
                  ref: payroll
                - type: Partial
                  ref: greeting
            """,
            "partials/payroll.yaml",
            """
            content:
              - type: Text
                text: "Secret salary table"
                eyesOnly: {roles: [hr]}
              - type: FormField
                id: bonus
                label: Bonus
                dataType: number
                readOnlyUnless: {roles: [hr]}
              - type: Partial
                ref: nested-secret
            """,
            "partials/nested-secret.yaml",
            """
            type: Text
            text: "Nested secret"
            eyesOnly: {roles: [hr]}
            """,
            "partials/greeting.yaml",
            """
            type: Text
            text: "${i18n.greeting}"
            """,
            "translations/en.yaml",
            """
            messages:
              greeting: Hello there
            """));
  }

  private String load(Map<String, String> headers) {
    return SpecsDir.over(
        fixture(),
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            var rq = RunActionRqDto.builder().route("/staff").actionId("").build();
            return JSON.valueToTree(mateu.run(rq, headers)).toString();
          }
        });
  }

  private static Map<String, String> english(Map<String, String> headers) {
    var all = new HashMap<>(headers);
    all.put("Accept-Language", "en");
    return all;
  }

  @Test
  void aGuardedSectionInAPartialIsRemovedForACallerWhoMayNotSeeIt() {
    var anonymous = load(english(Map.of()));
    assertThat(anonymous)
        .contains("Public text")
        .doesNotContain("Secret salary table")
        .doesNotContain("Nested secret")
        .doesNotContain("eyesOnly")
        .doesNotContain("readOnlyUnless");
  }

  @Test
  void theSameSectionReachesACallerWhoMay() {
    var hr = load(english(TestIdentities.headersWithRoles("hr")));
    assertThat(hr).contains("Secret salary table").contains("Nested secret");
  }

  @Test
  void aPartialsTextsAreTranslatedLikeInlineOnes() {
    var wire = load(english(Map.of()));
    assertThat(wire).contains("Hello there").doesNotContain("${i18n.greeting}");
  }
}
