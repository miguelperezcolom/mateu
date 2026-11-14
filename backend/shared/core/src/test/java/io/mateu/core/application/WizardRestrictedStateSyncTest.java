package io.mateu.core.application;

import static io.mateu.core.application.WizardCrossStepStateSyncTest.wire;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A wizard's state carries every step — the current one flat and each step as a nested map — so a
 * field a caller may not read ({@code @EyesOnly}) must stay out of BOTH, wherever its step is; and
 * a field the caller may not write ({@code @EyesOnly}, {@code @ReadOnlyUnless}) must not take a
 * value the client posted for it, nested or flat. Parity pin for the .NET/Python port fix D4.
 */
class WizardRestrictedStateSyncTest {

  public static class Applicant implements WizardStep {
    public String name = "Ada";
  }

  public static class Terms implements WizardStep {
    public String plan = "basic";

    @EyesOnly(roles = "admin")
    public String internalNote = "wizard-internal-secret";

    @ReadOnlyUnless(roles = "admin")
    public String discount = "none";
  }

  public static class Outcome implements WizardStep {
    public String outcome = "";
  }

  @SuppressWarnings("unused")
  @UI("/restricted-wizard")
  @Title("Restricted")
  public static class RestrictedWizard extends Wizard {
    Applicant applicant = new Applicant();
    Terms terms = new Terms();
    Outcome result;

    public String verdict = "";

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
      if ("probe".equals(actionId)) {
        verdict =
            ("forged".equals(terms.internalNote) ? "note-written" : "note-kept")
                + "/"
                + ("forged".equals(terms.discount) ? "discount-written" : "discount-kept");
        return this;
      }
      return super.handleAction(actionId, httpRequest);
    }

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
      var actions = new ArrayList<>(super.actions(httpRequest));
      actions.add(Action.builder().id("probe").build());
      return actions;
    }

    @WizardCompletionAction
    @Label("Finish")
    Object finish() {
      result = new Outcome();
      result.outcome = "done for " + applicant.name;
      return null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestrictedWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, String> headers) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/restricted-wizard")
            .consumedRoute("")
            .actionId(actionId)
            .serverSideType(RestrictedWizard.class.getName())
            .componentState(state)
            .initiatorComponentId("c1")
            .build(),
        headers);
  }

  private static String json(UIIncrementDto increment) {
    return io.mateu.core.infra.JsonSerializer.toJson(increment);
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>) increment.fragments().get(0).state();
  }

  private static Map<String, Object> forgedTerms() {
    var nested = new HashMap<String, Object>();
    nested.put("plan", "gold");
    nested.put("internalNote", "forged");
    nested.put("discount", "forged");
    return nested;
  }

  @Test
  void aHiddenFieldOfANonCurrentStepIsNotInTheStateOfACallerWhoMayNotReadIt() {
    var first = run("", Map.of(), Map.of());
    assertThat(state(first)).containsEntry("position", 0);
    assertThat(json(first)).contains("Ada").doesNotContain("wizard-internal-secret");
  }

  @Test
  void aHiddenFieldOfTheCurrentStepIsNotInTheStateOfACallerWhoMayNotReadIt() throws Exception {
    var first = run("", Map.of(), Map.of());
    var second = run("next", wire(state(first)), Map.of());
    assertThat(state(second)).containsEntry("position", 1);
    assertThat(json(second)).contains("basic").doesNotContain("wizard-internal-secret");
  }

  @Test
  void aCallerWithTheRoleSeesIt() {
    var first = run("", Map.of(), TestIdentities.headersWithRoles("admin"));
    assertThat(json(first)).contains("wizard-internal-secret");
  }

  @Test
  void aValuePostedForARestrictedFieldIsNotWrittenNestedOrFlat() throws Exception {
    var posted = new HashMap<>(wire(state(run("", Map.of(), Map.of()))));
    posted.put("terms", forgedTerms());
    var probed = run("probe", posted, Map.of());
    assertThat(state(probed)).containsEntry("verdict", "note-kept/discount-kept");

    // and on the step where the fields are current (flat keys)
    var onTerms = run("next", wire(state(probed)), Map.of());
    assertThat(state(onTerms)).containsEntry("position", 1);
    var flat = new HashMap<>(wire(state(onTerms)));
    flat.put("internalNote", "forged");
    flat.put("discount", "forged");
    var probedFlat = run("probe", flat, Map.of());
    assertThat(state(probedFlat)).containsEntry("verdict", "note-kept/discount-kept");
    assertThat(json(probedFlat)).doesNotContain("wizard-internal-secret");
  }

  @Test
  void aCallerWithTheRoleMayWriteThem() throws Exception {
    var admin = TestIdentities.headersWithRoles("admin");
    var posted = new HashMap<>(wire(state(run("", Map.of(), admin))));
    posted.put("terms", forgedTerms());
    var probed = run("probe", posted, admin);
    assertThat(state(probed)).containsEntry("verdict", "note-written/discount-written");
  }
}
