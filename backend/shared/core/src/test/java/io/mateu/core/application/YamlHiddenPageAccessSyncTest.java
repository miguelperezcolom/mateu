package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.data.Message;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The YAML access keys must survive the two situations where the personalised definition used to be
 * thrown away: the caller may see NOTHING of the page (its root is hidden), and personalising the
 * definition FAILS (here: the translation pass throws). In both, a locked field's client value used
 * to reach the view model and its action ran with it.
 */
class YamlHiddenPageAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  /** The view model bound to the YAML routes: it pays whatever salary it is hydrated with. */
  public static class PayrollView {
    public double salary = 100;

    @Action
    public Message pay() {
      return new Message("paid " + salary);
    }
  }

  static final String VIEW = PayrollView.class.getName();

  @TempDir Path dir;

  private static final String FIELDS =
      """
          - type: FormField
            id: salary
            label: Salary
            dataType: number
          - type: Button
            label: Pay
            actionId: pay
      """;

  private Path specs() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: payroll
                layout: payroll.yaml
                viewModel: %s
              - route: payroll-bare
                layout: payroll-bare.yaml
                viewModel: %s
              - route: payroll-locked
                layout: payroll-locked.yaml
                viewModel: %s
            """
                .formatted(VIEW, VIEW, VIEW),
            "payroll.yaml",
            """
            layout:
              type: VerticalLayout
              eyesOnly: admin
              content:
            """
                + FIELDS,
            "payroll-bare.yaml",
            """
            type: VerticalLayout
            eyesOnly: admin
            content:
            """
                + FIELDS.replaceAll("(?m)^  ", ""),
            "payroll-locked.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: salary
                  label: Salary
                  dataType: number
                  readOnlyUnless: admin
                - type: Button
                  label: Pay
                  actionId: pay
            """));
  }

  /** A translation catalogue whose pass over a tree always fails. */
  public static class BrokenTranslations extends TranslationRegistry {
    @Override
    public JsonNode translateTree(JsonNode node, String locale) {
      throw new IllegalStateException("translation pass broke");
    }
  }

  private static RunActionRqDto pay(String route) {
    return RunActionRqDto.builder()
        .route(route)
        .serverSideType(VIEW)
        .actionId("pay")
        .componentState(Map.of("salary", 999))
        .build();
  }

  private static RunActionRqDto load(String route) {
    return RunActionRqDto.builder()
        .route(route)
        .actionId("")
        .componentState(Map.of("salary", 999))
        .build();
  }

  /** The wire as JSON, or the exception the request ended in. */
  private static Object outcome(
      Path root, List<Object> beans, RunActionRqDto rq, Map<String, String> headers) {
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUisAndBeans(beans, PayrollView.class)) {
            try {
              return JSON.valueToTree(mateu.run(rq, headers)).toString();
            } catch (Throwable t) {
              return t;
            }
          }
        });
  }

  static final Map<String, String> ANONYMOUS = Map.of();
  static final Map<String, String> ADMIN = TestIdentities.headersWithRoles("admin");

  // ── the whole page hidden ───────────────────────────────────────────────────────────────────

  @Test
  void aCallerWhoMaySeeNothingOfAnEnvelopedPageIsRefusedAndItsStateNeverReachesTheViewModel() {
    var root = specs();
    assertThat(outcome(root, List.of(), pay("/payroll"), ANONYMOUS))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(outcome(root, List.of(), load("/payroll"), ANONYMOUS))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(outcome(root, List.of(), pay("/payroll"), ADMIN).toString()).contains("paid 999");
  }

  @Test
  void aCallerWhoMaySeeNothingOfABareLayoutIsRefusedToo() {
    var root = specs();
    assertThat(outcome(root, List.of(), pay("/payroll-bare"), ANONYMOUS))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(outcome(root, List.of(), pay("/payroll-bare"), ADMIN).toString())
        .contains("paid 999");
  }

  @Test
  void theHiddenLayoutNeverReachesTheWireForTheRefusedCaller() {
    var root = specs();
    var admin = outcome(root, List.of(), load("/payroll"), ADMIN).toString();
    assertThat(admin).contains("Salary");
    assertThat(outcome(root, List.of(), load("/payroll"), ANONYMOUS))
        .isInstanceOf(MateuForbiddenException.class);
  }

  // ── personalising the definition fails ──────────────────────────────────────────────────────

  @Test
  void aBrokenTranslationPassKeepsTheLockedFieldsLocked() {
    var root = specs();
    List<Object> broken = List.of(new BrokenTranslations());
    assertThat(outcome(root, broken, pay("/payroll-locked"), ANONYMOUS).toString())
        .contains("paid 100")
        .doesNotContain("paid 999");
    assertThat(outcome(root, broken, pay("/payroll-locked"), ADMIN).toString())
        .contains("paid 999");
    // the page still renders, restricted: the field is read-only for the anonymous caller
    var page = outcome(root, broken, load("/payroll-locked"), ANONYMOUS).toString();
    assertThat(page).contains("Salary").doesNotContain("readOnlyUnless").doesNotContain(":999");
  }

  @Test
  void aBrokenTranslationPassStillRefusesAHiddenPage() {
    var root = specs();
    List<Object> broken = List.of(new BrokenTranslations());
    assertThat(outcome(root, broken, pay("/payroll"), ANONYMOUS))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(outcome(root, broken, pay("/payroll"), ADMIN).toString()).contains("paid 999");
  }
}
