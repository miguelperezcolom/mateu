package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A YAML partial drawn inside a JAVA page ({@code new Partial("payroll")} in a {@link
 * ComponentTreeSupplier}) gets the same server-side treatment as one pulled in by a YAML page: its
 * access keys are applied for the caller and its {@code ${i18n.…}} texts translated. Before, the
 * Java path built the partial straight from the file — a section guarded by {@code eyesOnly:}
 * reached every caller (a Guest saw restricted fields in the Explorer).
 */
class JavaPagePartialAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  @UI("/java-page-with-partial")
  public static class JavaPageWithPartial implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(
          List.of(new Text("Public text"), new Partial("payroll"), new Partial("greeting")));
    }
  }

  @AfterEach
  void forgetCachedPartials() {
    PartialRegistry.instance().reset();
  }

  private Path fixture() {
    return SpecsDir.write(
        dir,
        Map.of(
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
          PartialRegistry.instance().reset();
          try (var mateu = TestMateu.withUis(JavaPageWithPartial.class)) {
            var rq = RunActionRqDto.builder().route("/java-page-with-partial").actionId("").build();
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
  void aGuardedPieceOfAYamlPartialInAJavaPageIsRemovedForACallerWhoMayNotSeeIt() {
    var anonymous = load(english(Map.of()));
    assertThat(anonymous)
        .contains("Public text")
        .doesNotContain("Secret salary table")
        .doesNotContain("eyesOnly")
        .doesNotContain("readOnlyUnless");
  }

  @Test
  void theSamePieceReachesACallerWhoMay() {
    var hr = load(english(TestIdentities.headersWithRoles("hr")));
    assertThat(hr).contains("Secret salary table");
  }

  @Test
  void aCallerWhoMaySeeTheFieldButNotEditItGetsItReadOnly() {
    var anonymous = load(english(Map.of()));
    assertThat(anonymous).contains("\"Bonus\"");
    var node = anonymous.substring(anonymous.indexOf("\"Bonus\"") - 600);
    assertThat(node).contains("\"readOnly\":true");
  }

  @Test
  void aPartialsTextsAreTranslatedInAJavaPageToo() {
    var wire = load(english(Map.of()));
    assertThat(wire).contains("Hello there").doesNotContain("${i18n.greeting}");
  }
}
