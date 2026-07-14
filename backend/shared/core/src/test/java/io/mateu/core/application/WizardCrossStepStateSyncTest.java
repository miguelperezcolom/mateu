package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Cross-step wizard state through a BROWSER-FAITHFUL wire: the component state is JSON round
 * tripped between requests and whole doubles are integerized (JS sends 343 for 343.0), exactly like
 * the real client does. Steps carry Callable&lt;Component&gt; holder fields WITHOUT @JsonIgnore.
 *
 * <p>Regression for the demo-front-office check-in wizard: every step used to reset to its field
 * initializers on each action because the Jackson-serialized holder husks ({}) inside the nested
 * step maps made the whole step's rehydration fail, so values entered in one step died as soon as
 * the user navigated or ran an action — forcing wizard-level mirror fields as a workaround.
 */
class WizardCrossStepStateSyncTest {

  public static class StepOne implements WizardStep {
    public String name = "Ada";
    public Callable<Component> header = () -> Text.builder().text("hi " + name).build();
  }

  public static class StepTwo implements WizardStep {
    public Double amount = 0.0;
    public Callable<Component> banner = () -> Text.builder().text("amt " + amount).build();
  }

  public static class StepThree implements WizardStep {
    public String note = "";
  }

  public static class ResultStep implements WizardStep {
    public String outcome = "done";
  }

  @SuppressWarnings("unused")
  @UI("/probe-wizard")
  @Title("Probe")
  public static class ProbeWizard extends Wizard {
    StepOne one = new StepOne();
    StepTwo two = new StepTwo();
    StepThree three = new StepThree();
    ResultStep result;

    // an action (dispatched e.g. by a component of the CURRENT step) that mutates ANOTHER step
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
      if ("annotate".equals(actionId)) {
        three.note = "noted from step " + (currentStepNumber() + 1);
        return this;
      }
      return super.handleAction(actionId, httpRequest);
    }

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
      var actions = new ArrayList<>(super.actions(httpRequest));
      actions.add(Action.builder().id("annotate").build());
      return actions;
    }

    @WizardCompletionAction
    @Label("Finish")
    Object finish() {
      result = new ResultStep();
      result.outcome = "Hello " + one.name + " (" + two.amount + ")";
      return null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProbeWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void valuesEnteredInAnyStepSurviveNavigationForwardAndBackOnTheWire() throws Exception {
    var first = mateu.sync("/probe-wizard");
    // holder fields never reach the state — neither flat nor inside the nested step maps
    assertThat(state(first)).doesNotContainKeys("header", "banner");
    assertThat(nested(state(first), "one")).doesNotContainKey("header");

    // edit step 1, go to step 2
    var s1 = wire(state(first));
    s1.put("name", "Eva");
    var second = run("next", s1);
    assertThat(state(second)).containsEntry("position", 1);

    // edit step 2 (the client integerizes the whole double), go to step 3
    var s2 = wire(state(second));
    s2.put("amount", 343); // what the JS client sends for 343.0
    var third = run("next", s2);

    // both earlier steps' values are still on the wire, with the double back as a double
    var thirdState = state(third);
    assertThat(thirdState).containsEntry("position", 2);
    assertThat(nested(thirdState, "one")).containsEntry("name", "Eva");
    assertThat(nested(thirdState, "two")).containsEntry("amount", 343.0);

    // navigate BACK — nothing resets
    var back = run("back", wire(thirdState));
    var backState = state(back);
    assertThat(backState).containsEntry("position", 1);
    assertThat(backState).containsEntry("amount", 343.0); // current step binds the flat key
    assertThat(nested(backState, "one")).containsEntry("name", "Eva");

    // and the completion action sees the values captured across all steps
    var backToThird = run("next", wire(backState));
    var done = run("finish", wire(state(backToThird)));
    assertThat(state(done)).containsEntry("outcome", "Hello Eva (343.0)");
  }

  @Test
  void anActionRunOnOneStepCanMutateAnotherStepAndTheChangeSurvivesNavigation() throws Exception {
    var first = mateu.sync("/probe-wizard");

    // an action fired while on step 1 writes into step 3
    var annotated = run("annotate", wire(state(first)));
    assertThat(nested(state(annotated), "three")).containsEntry("note", "noted from step 1");

    // navigate forward twice — the mutation is still there when step 3 renders
    var second = run("next", wire(state(annotated)));
    var third = run("next", wire(state(second)));
    var thirdState = state(third);
    assertThat(thirdState).containsEntry("position", 2);
    assertThat(thirdState).containsEntry("note", "noted from step 1");
  }

  private UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/probe-wizard")
            .actionId(actionId)
            .serverSideType(ProbeWizard.class.getName())
            .componentState(state)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>) increment.fragments().get(0).state();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> nested(Map<String, Object> state, String key) {
    assertThat(state.get(key)).isInstanceOf(Map.class);
    return (Map<String, Object>) state.get(key);
  }

  /** JSON round-trip + JS-style integerization of whole doubles: what the browser echoes back. */
  @SuppressWarnings("unchecked")
  static Map<String, Object> wire(Map<String, Object> state) throws Exception {
    var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
    mapper.configure(
        com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    var json = mapper.writeValueAsString(state);
    var parsed = mapper.readValue(json, Map.class);
    return (Map<String, Object>) jsify(parsed);
  }

  static Object jsify(Object v) {
    if (v instanceof Double d && d == Math.floor(d) && !Double.isInfinite(d)) {
      long l = (long) (double) d;
      return (l >= Integer.MIN_VALUE && l <= Integer.MAX_VALUE) ? (Object) (int) l : (Object) l;
    }
    if (v instanceof Map<?, ?> m) {
      var out = new LinkedHashMap<String, Object>();
      m.forEach((k, val) -> out.put(String.valueOf(k), jsify(val)));
      return out;
    }
    if (v instanceof List<?> l) {
      return l.stream().map(WizardCrossStepStateSyncTest::jsify).toList();
    }
    return v;
  }
}
