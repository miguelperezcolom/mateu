package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.infra.security.ClientLockedFields;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A route's {@code state:} seed of a field a YAML PARTIAL or a {@code components.yaml} business
 * component hides from the caller ({@code eyesOnly:}) never reaches that caller — the same rule as
 * a field hidden inline (conformance case {@code yaml-eyes-only}). The pieces are composed into the
 * page while it is mapped, after the route seeded its state, so their hidden fields have to be
 * dropped from the seeds explicitly. A read-only field of a piece keeps its seed: it is drawn, with
 * its value.
 */
class YamlPieceHiddenSeedSyncTest {

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
                state:
                  name: Ada
                  salary: "SALARY-SEED"
                  bonus: 1234
                  payrollNote: "PAYROLL-SEED"
            """,
            "staff.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - {type: FormField, id: name, label: Name, dataType: string}
                - type: Partial
                  ref: payroll
                - type: ComponentRef
                  ref: Payroll
            """,
            "partials/payroll.yaml",
            """
            content:
              - {type: FormField, id: salary, label: Salary, dataType: string, eyesOnly: {roles: [hr]}}
              - {type: FormField, id: bonus, label: Bonus, dataType: number, readOnlyUnless: {roles: [hr]}}
            """,
            "components.yaml",
            """
            - name: Payroll
              component:
                type: VerticalLayout
                content:
                  - {type: FormField, id: payrollNote, label: Note, dataType: string, eyesOnly: {roles: [hr]}}
            """));
  }

  private String load(Map<String, String> headers) {
    return SpecsDir.over(
        fixture(),
        cl -> {
          PartialRegistry.instance().reset();
          ClientLockedFields.reset();
          try (var mateu = TestMateu.withUis()) {
            var rq = RunActionRqDto.builder().route("/staff").actionId("").build();
            return JSON.valueToTree(mateu.run(rq, headers)).toString();
          }
        });
  }

  @Test
  void aSeedOfAFieldAPieceHidesNeverReachesTheCaller() {
    var anonymous = load(Map.of());
    assertThat(anonymous)
        .contains("Ada")
        .contains("1234")
        .doesNotContain("SALARY-SEED")
        .doesNotContain("PAYROLL-SEED");
  }

  @Test
  void theSeedsReachACallerWhoMaySeeTheFields() {
    var hr = load(TestIdentities.headersWithRoles("hr"));
    assertThat(hr).contains("SALARY-SEED").contains("PAYROLL-SEED");
  }
}
