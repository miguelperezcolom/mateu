package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.Component;
import java.util.ArrayList;
import java.util.List;

final class WizardButtonBuilder {

  static List<Component> createButtons(WizardOrchestrator wizard) {
    List<Component> buttons = new ArrayList<>();
    buttons.add(Button.builder().id("back").label("Back").disabled(wizard.position == 0).build());
    if (wizard.position < wizard.numberOfSteps() - 1) {
      buttons.add(
          Button.builder()
              .id("next")
              .label("Next")
              .disabled(wizard.position == wizard.numberOfSteps() - 1)
              .build());
    } else {
      getAllMethods(wizard.getClass()).stream()
          .filter(method -> method.isAnnotationPresent(WizardCompletionAction.class))
          .forEach(
              method ->
                  buttons.add(
                      Button.builder()
                          .label(getLabel(method))
                          .buttonStyle(ButtonStyle.primary)
                          .build()));
    }
    getAllMethods(wizard.currentStepField().getType()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method ->
                buttons.add(
                    Button.builder().actionId(method.getName()).label(getLabel(method)).build()));
    return buttons;
  }
}
