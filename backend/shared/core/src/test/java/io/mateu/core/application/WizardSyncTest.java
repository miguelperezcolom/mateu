package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AccordionLayoutDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.ProgressBarDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardLayout;
import io.mateu.uidl.annotations.WizardLayoutMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * End-to-end (in-JVM) exercise of the wizard orchestrator through the real sync/run pipeline: route
 * → first step form + progress + buttons, "next"/"back" navigation with state hydration, branching
 * (skipped steps jumped in both directions, progress recalculated), the
 * {@code @WizardCompletionAction} → result step, enum state round-trips, and the
 * ACCORDION/ACCUMULATIVE layout variants.
 */
class WizardSyncTest {

  // --- fixtures: a plain 2-step + result wizard ------------------------------------------------

  public enum Flavor {
    VANILLA,
    CHOCOLATE
  }

  public static class NameStep implements WizardStep {
    public String name = "Ada";
    public Flavor flavor = Flavor.VANILLA;
  }

  public static class AgeStep implements WizardStep {
    public int age = 30;
  }

  public static class DoneStep implements WizardStep {
    @PlainText public String message = "pending";
  }

  @SuppressWarnings("unused")
  @UI("/simple-wizard")
  @Title("Simple signup")
  public static class SimpleWizard extends Wizard {
    NameStep nameStep = new NameStep();
    AgeStep ageStep = new AgeStep();
    DoneStep done;

    @WizardCompletionAction
    @Label("Finish")
    Object finish() {
      done = new DoneStep();
      done.message = "Hello " + nameStep.name + " (" + ageStep.age + ")";
      return null;
    }
  }

  // --- fixtures: a branching wizard (company step only applies for COMPANY accounts) -----------

  public enum AccountType {
    PERSONAL,
    COMPANY
  }

  public static class AccountStep implements WizardStep {
    public AccountType accountType = AccountType.PERSONAL;
  }

  public static class CompanyStep implements WizardStep {
    public String companyName = "ACME";
  }

  public static class PlanStep implements WizardStep {
    public String plan = "FREE";
  }

  public static class SignupResult implements WizardStep {
    @PlainText public String outcome = "created";
  }

  @SuppressWarnings("unused")
  @UI("/branching-wizard")
  @Title("Branching signup")
  public static class BranchingWizard extends Wizard {
    AccountStep account = new AccountStep();
    CompanyStep company = new CompanyStep();
    PlanStep planStep = new PlanStep();
    SignupResult signupResult;

    @Override
    protected boolean stepApplies(String stepFieldName) {
      if ("company".equals(stepFieldName)) {
        return account != null && account.accountType == AccountType.COMPANY;
      }
      return true;
    }

    @WizardCompletionAction
    @Label("Create account")
    Object createAccount() {
      return null;
    }
  }

  // --- fixtures: skipping the penultimate step moves the completion button ---------------------

  @SuppressWarnings("unused")
  @UI("/short-circuit-wizard")
  @Title("Short circuit")
  public static class ShortCircuitWizard extends Wizard {
    AccountStep account = new AccountStep();
    CompanyStep company = new CompanyStep(); // penultimate — skipped for PERSONAL accounts
    SignupResult signupResult;

    @Override
    protected boolean stepApplies(String stepFieldName) {
      if ("company".equals(stepFieldName)) {
        return account != null && account.accountType == AccountType.COMPANY;
      }
      return true;
    }

    @WizardCompletionAction
    @Label("Create")
    Object create() {
      return null;
    }
  }

  // --- fixtures: layout variants ----------------------------------------------------------------

  public static class StepOne implements WizardStep {
    public String first = "one";
  }

  public static class StepTwo implements WizardStep {
    public String second = "two";
  }

  public static class FinalStep implements WizardStep {
    @PlainText public String recap = "done";
  }

  @SuppressWarnings("unused")
  @UI("/accordion-wizard")
  @Title("Accordion wizard")
  @WizardLayout(WizardLayoutMode.ACCORDION)
  public static class AccordionWizard extends Wizard {
    StepOne one = new StepOne();
    StepTwo two = new StepTwo();
    FinalStep fin;

    @WizardCompletionAction
    @Label("Complete")
    Object complete() {
      return null;
    }
  }

  @SuppressWarnings("unused")
  @UI("/accumulative-wizard")
  @Title("Accumulative wizard")
  @WizardLayout(WizardLayoutMode.ACCUMULATIVE)
  public static class AccumulativeWizard extends Wizard {
    StepOne one = new StepOne();
    StepTwo two = new StepTwo();
    FinalStep fin;

    @WizardCompletionAction
    @Label("Complete")
    Object complete() {
      return null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            SimpleWizard.class,
            BranchingWizard.class,
            ShortCircuitWizard.class,
            AccordionWizard.class,
            AccumulativeWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // --- sync: first step -------------------------------------------------------------------------

  @Test
  void syncRendersTheFirstStepFormStateWithFieldDefaults() {
    var increment = mateu.sync("/simple-wizard");

    var component = serverComponent(increment);
    assertThat(component.serverSideType()).isEqualTo(SimpleWizard.class.getName());
    var state = state(increment);
    assertThat(state).containsEntry("name", "Ada").containsEntry("position", 0);
  }

  @Test
  void syncShowsAProgressBarStartingAtZeroOverAllSteps() {
    var increment = mateu.sync("/simple-wizard");

    var progress = single(findAllMetadata(component(increment), ProgressBarDto.class));
    assertThat(progress.value()).isEqualTo(0.0);
    assertThat(progress.max()).isEqualTo(3); // 2 editable steps + result step
  }

  @Test
  void syncShowsNextEnabledAndBackDisabledOnTheFirstStep() {
    var increment = mateu.sync("/simple-wizard");

    var buttons = findAllMetadata(component(increment), ButtonDto.class);
    var next = buttonByActionId(buttons, "next");
    var back = buttonByActionId(buttons, "back");
    assertThat(next.disabled()).isFalse();
    assertThat(back.disabled()).isTrue();
  }

  @Test
  void syncAdvertisesTheNextActionWithValidationRequired() {
    var increment = mateu.sync("/simple-wizard");

    var component = serverComponent(increment);
    assertThat(component.actions())
        .anySatisfy(
            action -> {
              assertThat(action.id()).isEqualTo("next");
              assertThat(action.validationRequired()).isTrue();
            });
  }

  @Test
  void syncShowsTheWizardTitleAsAHeading() {
    var increment = mateu.sync("/simple-wizard");

    var texts = findAllMetadata(component(increment), TextDto.class);
    assertThat(texts).anySatisfy(text -> assertThat(text.text()).isEqualTo("Simple signup"));
  }

  // --- next / back navigation --------------------------------------------------------------------

  @Test
  void runningNextMovesToTheSecondStepCarryingTheEditedState() {
    var first = mateu.sync("/simple-wizard");
    var state = mutableState(first);
    state.put("name", "Eva");

    var second = run("/simple-wizard", SimpleWizard.class, "next", state);

    var secondState = state(second);
    assertThat(secondState).containsEntry("position", 1).containsEntry("age", 30);
    // the edited first-step answer is preserved in the wizard's flattened state
    assertThat(secondState).containsEntry("name", "Eva");
    var progress = single(findAllMetadata(component(second), ProgressBarDto.class));
    assertThat(progress.value()).isEqualTo(1.0);
  }

  @Test
  void runningBackReturnsToTheFirstStepPreservingAnswers() {
    var first = mateu.sync("/simple-wizard");
    var state = mutableState(first);
    state.put("name", "Eva");
    var second = run("/simple-wizard", SimpleWizard.class, "next", state);

    var backAgain = run("/simple-wizard", SimpleWizard.class, "back", mutableState(second));

    var backState = state(backAgain);
    assertThat(backState).containsEntry("position", 0).containsEntry("name", "Eva");
    var buttons = findAllMetadata(component(backAgain), ButtonDto.class);
    assertThat(buttonByActionId(buttons, "back").disabled()).isTrue();
  }

  @Test
  void thePenultimateStepShowsTheCompletionButtonInsteadOfNext() {
    var first = mateu.sync("/simple-wizard");
    var second = run("/simple-wizard", SimpleWizard.class, "next", mutableState(first));

    var buttons = findAllMetadata(component(second), ButtonDto.class);
    assertThat(buttons).noneMatch(button -> "next".equals(button.actionId()));
    var finish = buttonByActionId(buttons, "finish");
    assertThat(finish.label()).isEqualTo("Finish");
  }

  // --- completion action → result step
  // ------------------------------------------------------------

  @Test
  void runningTheCompletionActionRendersTheResultStepAtFullProgress() {
    var first = mateu.sync("/simple-wizard");
    var state = mutableState(first);
    state.put("name", "Eva");
    var second = run("/simple-wizard", SimpleWizard.class, "next", state);
    var secondState = mutableState(second);
    secondState.put("age", 42);

    var result = run("/simple-wizard", SimpleWizard.class, "finish", secondState);

    var resultState = state(result);
    assertThat(resultState).containsEntry("position", 2).containsEntry("message", "Hello Eva (42)");
    var progress = single(findAllMetadata(component(result), ProgressBarDto.class));
    assertThat(progress.value()).isEqualTo(progress.max());
  }

  @Test
  void theResultStepShowsNoNavigationButtons() {
    var first = mateu.sync("/simple-wizard");
    var second = run("/simple-wizard", SimpleWizard.class, "next", mutableState(first));

    var result = run("/simple-wizard", SimpleWizard.class, "finish", mutableState(second));

    var buttons = findAllMetadata(component(result), ButtonDto.class);
    assertThat(buttons).isEmpty();
  }

  // --- branching
  // ----------------------------------------------------------------------------------

  @Test
  void aSkippedStepIsJumpedForwardAndTheProgressBarShrinks() {
    var first = mateu.sync("/branching-wizard");
    var state = mutableState(first);
    state.put("accountType", "PERSONAL");

    var second = run("/branching-wizard", BranchingWizard.class, "next", state);

    // PERSONAL → the company step is skipped: we land directly on the plan step
    var secondState = state(second);
    assertThat(secondState).containsEntry("position", 2).containsEntry("plan", "FREE");
    var progress = single(findAllMetadata(component(second), ProgressBarDto.class));
    assertThat(progress.max()).isEqualTo(3); // account + plan + result (company excluded)
    assertThat(progress.value()).isEqualTo(1.0);
  }

  @Test
  void aSkippedStepIsJumpedBackwardToo() {
    var first = mateu.sync("/branching-wizard");
    var state = mutableState(first);
    state.put("accountType", "PERSONAL");
    var second = run("/branching-wizard", BranchingWizard.class, "next", state);

    var back = run("/branching-wizard", BranchingWizard.class, "back", mutableState(second));

    assertThat(state(back)).containsEntry("position", 0);
  }

  @Test
  void theBranchStepIsShownWhenItApplies() {
    var first = mateu.sync("/branching-wizard");
    var state = mutableState(first);
    state.put("accountType", "COMPANY");

    var second = run("/branching-wizard", BranchingWizard.class, "next", state);

    var secondState = state(second);
    assertThat(secondState).containsEntry("position", 1).containsEntry("companyName", "ACME");
    var progress = single(findAllMetadata(component(second), ProgressBarDto.class));
    assertThat(progress.max()).isEqualTo(4); // all steps apply for COMPANY accounts
  }

  @Test
  void whenThePenultimateStepIsSkippedTheCompletionButtonMovesToTheLastApplicableStep() {
    var increment = mateu.sync("/short-circuit-wizard");

    // default PERSONAL → the (penultimate) company step never applies, so the very first step
    // already shows the completion button and no next button
    var buttons = findAllMetadata(component(increment), ButtonDto.class);
    assertThat(buttons).noneMatch(button -> "next".equals(button.actionId()));
    assertThat(buttonByActionId(buttons, "create").label()).isEqualTo("Create");
  }

  // --- enum state round-trip
  // ----------------------------------------------------------------------

  @Test
  void enumTypedStepFieldsSurviveStateSerialization() {
    var first = mateu.sync("/simple-wizard");
    assertThat(state(first)).containsEntry("flavor", "VANILLA");

    var state = mutableState(first);
    state.put("flavor", "CHOCOLATE");
    var second = run("/simple-wizard", SimpleWizard.class, "next", state);
    var back = run("/simple-wizard", SimpleWizard.class, "back", mutableState(second));

    assertThat(state(back)).containsEntry("flavor", "CHOCOLATE");
  }

  // --- layout variants
  // ----------------------------------------------------------------------------

  @Test
  void anAccordionWizardRendersOnePanelPerStepWithOnlyTheCurrentOneActive() {
    var increment = mateu.sync("/accordion-wizard");

    // The mapper leaves AccordionLayoutDto.panels empty: each panel travels as a CHILD
    // component whose metadata is an AccordionPanelDto.
    single(findAllMetadata(component(increment), AccordionLayoutDto.class));
    var panels = findAllMetadata(component(increment), io.mateu.dtos.AccordionPanelDto.class);
    assertThat(panels).hasSize(3);
    assertThat(panels.get(0).active()).isTrue();
    assertThat(panels.get(0).disabled()).isFalse();
    assertThat(panels.get(1).active()).isFalse();
    assertThat(panels.get(1).disabled()).isTrue();
    assertThat(panels.get(2).disabled()).isTrue();
  }

  @Test
  void anAccumulativeWizardShowsAPreviousAnswersRecapOnceAStepIsCompleted() {
    var first = mateu.sync("/accumulative-wizard");
    var firstTexts = findAllMetadata(component(first), TextDto.class);
    assertThat(firstTexts).noneMatch(text -> "Previous answers".equals(text.text()));

    var state = mutableState(first);
    state.put("first", "uno");
    var second = run("/accumulative-wizard", AccumulativeWizard.class, "next", state);
    assertThat(state(second)).containsEntry("position", 1);

    var texts = findAllMetadata(component(second), TextDto.class);
    assertThat(texts).anySatisfy(text -> assertThat(text.text()).isEqualTo("Previous answers"));
    assertThat(texts).anySatisfy(text -> assertThat(text.text()).contains("uno"));
  }

  // --- helpers
  // ------------------------------------------------------------------------------------

  private UIIncrementDto run(
      String route, Class<?> wizardClass, String actionId, Map<String, Object> componentState) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .serverSideType(wizardClass.getName())
            .componentState(componentState)
            .build());
  }

  private static ComponentDto component(UIIncrementDto increment) {
    assertThat(increment.fragments()).isNotEmpty();
    return increment.fragments().get(0).component();
  }

  private static ServerSideComponentDto serverComponent(UIIncrementDto increment) {
    var component = component(increment);
    assertThat(component).isInstanceOf(ServerSideComponentDto.class);
    return (ServerSideComponentDto) component;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>) increment.fragments().get(0).state();
  }

  private static Map<String, Object> mutableState(UIIncrementDto increment) {
    return new HashMap<>(state(increment));
  }

  private static <T> T single(List<T> items) {
    assertThat(items).hasSize(1);
    return items.get(0);
  }

  private static ButtonDto buttonByActionId(List<ButtonDto> buttons, String actionId) {
    return buttons.stream()
        .filter(button -> actionId.equals(button.actionId()))
        .findFirst()
        .orElseThrow(
            () ->
                new AssertionError(
                    "no button with actionId '"
                        + actionId
                        + "' among "
                        + buttons.stream().map(ButtonDto::actionId).toList()));
  }

  /** Depth-first collection of every metadata DTO of the given type in the component tree. */
  private static <T extends ComponentMetadataDto> List<T> findAllMetadata(
      Object component, Class<T> type) {
    var found = new ArrayList<T>();
    collect(component, type, found);
    return found;
  }

  private static <T extends ComponentMetadataDto> void collect(
      Object component, Class<T> type, List<T> found) {
    if (component instanceof ClientSideComponentDto client) {
      if (type.isInstance(client.metadata())) {
        found.add(type.cast(client.metadata()));
      }
      // Cards carry their title/content as nested components inside the METADATA, not as
      // children — descend into them too (the accumulative recap lives there).
      if (client.metadata() instanceof io.mateu.dtos.CardDto card) {
        collect(card.title(), type, found);
        collect(card.content(), type, found);
      }
      for (var child : client.children()) {
        collect(child, type, found);
      }
    }
    if (component instanceof ServerSideComponentDto server) {
      for (var child : server.children()) {
        collect(child, type, found);
      }
    }
  }
}
