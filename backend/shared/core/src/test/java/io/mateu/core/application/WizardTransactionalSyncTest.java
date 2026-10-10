package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.data.WizardDisplay;
import io.mateu.uidl.interfaces.Draftable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The transactional half of the Redwood guided process on the {@code Wizard}: drafts ({@link
 * Draftable} → Save / Save and close + resume on the step left), Skip on {@code stepSkippable}
 * steps, early completion ({@code @WizardCompletionAction(availableFromStep)}), the cancelable
 * {@code beforeStepNavigate} hook and the {@link WizardDisplay} tri-state switches.
 */
class WizardTransactionalSyncTest {

  public static class Contact implements WizardStep {
    @jakarta.validation.constraints.NotEmpty public String email = "";
  }

  public static class Preferences implements WizardStep {
    public String newsletter = "no";
  }

  public static class Extras implements WizardStep {
    public String notes = "";
  }

  public static class Done implements WizardStep {
    @PlainText public String result = "pending";
  }

  static final List<String> DRAFTS = new ArrayList<>();
  static String resumeOn;

  @UI("/draft-wizard")
  @Title("Onboarding")
  public static class DraftWizard extends Wizard implements Draftable {
    Contact contact = new Contact();
    Preferences preferences = new Preferences();
    Extras extras = new Extras();
    Done done;

    @Override
    public Object saveDraft(HttpRequest httpRequest) {
      DRAFTS.add(contact.email + "|" + currentStepField().getName());
      return null;
    }

    @Override
    public Object closeDraft(HttpRequest httpRequest) {
      return java.net.URI.create("/home");
    }

    @Override
    public String resumeStep(HttpRequest httpRequest) {
      return resumeOn;
    }

    @Override
    protected boolean stepSkippable(String stepFieldName) {
      return "preferences".equals(stepFieldName);
    }

    @Override
    protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
      if ("contact".equals(fromStep) && contact.email.endsWith("@blocked.test")) {
        return Message.error("That domain is not allowed");
      }
      return null;
    }

    @WizardCompletionAction(availableFromStep = "preferences")
    @Label("Finish now")
    Object finish() {
      done = new Done();
      done.result = "finished by " + contact.email;
      return null;
    }
  }

  @UI("/locked-wizard")
  @Title("Locked")
  public static class LockedWizard extends DraftWizard {
    @Override
    protected WizardDisplay display() {
      return WizardDisplay.defaults().toBuilder()
          .saveDraft(Toggle.disabled)
          .saveAndClose(Toggle.off)
          .skip(Toggle.off)
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DraftWizard.class, LockedWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    DRAFTS.clear();
    resumeOn = null;
  }

  @Test
  void aDraftableWizardOffersSaveAndSaveAndClose() {
    var buttons = buttons(mateu.sync("/draft-wizard"));
    assertThat(button(buttons, "saveDraft")).isPresent();
    assertThat(button(buttons, "saveAndClose")).isPresent();
    assertThat(button(buttons, "saveDraft").get().label()).isEqualTo("Save");
  }

  @Test
  void savingADraftDoesNotValidateAndKeepsTheStep() {
    var state = state(mateu.sync("/draft-wizard"));
    state.put("email", "");
    var increment = run("/draft-wizard", DraftWizard.class, "saveDraft", state);
    assertThat(DRAFTS).containsExactly("|contact");
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("Draft saved"));
  }

  @Test
  void saveAndCloseSavesThenLeavesTheFlow() {
    var state = state(mateu.sync("/draft-wizard"));
    state.put("email", "ada@x.test");
    var increment = run("/draft-wizard", DraftWizard.class, "saveAndClose", state);
    assertThat(DRAFTS).containsExactly("ada@x.test|contact");
    assertThat(increment.commands())
        .anySatisfy(
            c -> {
              assertThat(c.type()).isEqualTo(UICommandTypeDto.NavigateTo);
              assertThat(c.data()).isEqualTo("/home");
            });
    assertThat(increment.commands()).anyMatch(c -> c.type() == UICommandTypeDto.MarkAsClean);
  }

  @Test
  void aDraftableWizardResumesOnTheStepTheUserLeft() {
    resumeOn = "extras";
    var increment = mateu.sync("/draft-wizard");
    assertThat(state(increment)).containsEntry("position", 2);
  }

  @Test
  void skipIsOfferedOnlyOnSkippableStepsAndMovesOnWithoutRequiringAnything() {
    var first = mateu.sync("/draft-wizard");
    assertThat(button(buttons(first), "skip")).isEmpty();

    var state = state(first);
    state.put("email", "ada@x.test");
    var second = run("/draft-wizard", DraftWizard.class, "next", state);
    assertThat(state(second)).containsEntry("position", 1);
    assertThat(button(buttons(second), "skip")).isPresent();

    var third = run("/draft-wizard", DraftWizard.class, "skip", state(second));
    assertThat(state(third)).containsEntry("position", 2);
  }

  @Test
  void aCompletionActionIsOfferedEarlyFromItsAvailableFromStep() {
    var first = mateu.sync("/draft-wizard");
    assertThat(button(buttons(first), "finish")).isEmpty();

    var state = state(first);
    state.put("email", "ada@x.test");
    var second = run("/draft-wizard", DraftWizard.class, "next", state);
    // beside Next, not instead of it
    assertThat(button(buttons(second), "finish")).isPresent();
    assertThat(button(buttons(second), "next")).isPresent();

    var finished = run("/draft-wizard", DraftWizard.class, "finish", state(second));
    assertThat(state(finished)).containsEntry("position", 3);
  }

  @Test
  void beforeStepNavigateCancelsTheMoveWithItsAnswer() {
    var state = state(mateu.sync("/draft-wizard"));
    state.put("email", "eve@blocked.test");
    var increment = run("/draft-wizard", DraftWizard.class, "next", state);
    assertThat(increment.messages())
        .anySatisfy(m -> assertThat(m.text()).isEqualTo("That domain is not allowed"));
    // no re-render: the wizard stays where it was
    assertThat(increment.fragments()).noneMatch(f -> f.component() != null);
  }

  @Test
  void displayTogglesHideOrDisableTheAffordances() {
    var first = mateu.sync("/locked-wizard");
    var buttons = buttons(first);
    assertThat(button(buttons, "saveDraft")).isPresent();
    assertThat(button(buttons, "saveDraft").get().disabled()).isTrue();
    assertThat(button(buttons, "saveAndClose")).isEmpty();

    var state = state(first);
    state.put("email", "ada@x.test");
    var second = run("/locked-wizard", LockedWizard.class, "next", state);
    assertThat(button(buttons(second), "skip")).isEmpty();
    // a disabled affordance cannot be forced from the client either
    run("/locked-wizard", LockedWizard.class, "saveDraft", state(second));
    assertThat(DRAFTS).isEmpty();
  }

  // --- helpers ---------------------------------------------------------------------------------

  private UIIncrementDto run(
      String route, Class<?> type, String actionId, Map<String, Object> componentState) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .serverSideType(type.getName())
            .componentState(componentState)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return new HashMap<>((Map<String, Object>) increment.fragments().get(0).state());
  }

  private static List<ButtonDto> buttons(UIIncrementDto increment) {
    var component = increment.fragments().get(0).component();
    assertThat(component).isInstanceOf(ServerSideComponentDto.class);
    return WireWalk.all(component, ButtonDto.class);
  }

  private static Optional<ButtonDto> button(List<ButtonDto> buttons, String actionId) {
    return buttons.stream().filter(b -> actionId.equals(b.actionId())).findFirst();
  }
}
