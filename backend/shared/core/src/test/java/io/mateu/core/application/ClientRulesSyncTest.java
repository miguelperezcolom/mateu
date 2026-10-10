package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RuleDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Field-dependent rules evaluated in the browser: @Hidden(expr) and @Disabled(expr) travel as
 * SetDataValue rules whose expression is the declared one. @Disabled used to drop its expression
 * (always "true"), so a field meant to be enabled by another stayed disabled for good.
 */
class ClientRulesSyncTest {

  @SuppressWarnings("unused")
  @UI("/client-rules")
  @Title("Client rules")
  public static class RulesForm {
    String guarantee = "NONE";

    @Hidden("state.guarantee != 'CREDIT_CARD'")
    String cardNumber;

    @Disabled("state.guarantee != 'COMPANY'")
    String company;

    @Disabled String alwaysDisabled;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RulesForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<RuleDto> rules() {
    return ((ServerSideComponentDto) mateu.sync("/client-rules").fragments().get(0).component())
        .rules();
  }

  @Test
  void disabledAndHiddenCarryTheirDeclaredExpression() {
    assertThat(rules())
        .extracting(
            RuleDto::fieldName, r -> String.valueOf(r.fieldAttribute()), RuleDto::expression)
        .contains(
            org.assertj.core.groups.Tuple.tuple(
                "cardNumber", "hidden", "state.guarantee != 'CREDIT_CARD'"),
            org.assertj.core.groups.Tuple.tuple(
                "company", "disabled", "state.guarantee != 'COMPANY'"),
            org.assertj.core.groups.Tuple.tuple("alwaysDisabled", "disabled", "true"));
  }
}
