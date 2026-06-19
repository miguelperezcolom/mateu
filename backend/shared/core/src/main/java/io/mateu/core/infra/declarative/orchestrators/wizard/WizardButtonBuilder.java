package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.ArrayList;
import java.util.List;

final class WizardButtonBuilder {

  static List<Component> createButtons(Wizard wizard, HttpRequest httpRequest) {
    List<Component> buttons = new ArrayList<>();
    boolean isLastStep = wizard.position == wizard.numberOfSteps() - 1;
    if (!isLastStep) {
      buttons.add(Button.builder().id("back").label("Back").disabled(wizard.position == 0).build());
    }
    if (wizard.position < wizard.numberOfSteps() - 2) {
      buttons.add(
          Button.builder()
              .id("next")
              .label("Next")
              .build());
    } else if (!isLastStep) {
      getAllMethods(wizard.getClass()).stream()
          .filter(method -> method.isAnnotationPresent(WizardCompletionAction.class))
          .forEach(
              method ->
                  buttons.add(
                      Button.builder()
                          .actionId(method.getName())
                          .label(getLabel(method))
                          .buttonStyle(ButtonStyle.primary)
                          .build()));
    }
    var step = wizard.getStep();
    getAllMethods(wizard.currentStepField().getType()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .filter(
            method ->
                !method.isAnnotationPresent(Hidden.class)
                    || !method.getAnnotation(Hidden.class).value().isEmpty())
        .filter(
            method ->
                !(step instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .forEach(
            method -> {
              var ann = method.getAnnotation(Toolbar.class);
              var buttonStyle = ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
              var buttonColor = ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
              var buttonSize = ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : null;
              buttons.add(
                  Button.builder()
                      .actionId(method.getName())
                      .label(getLabel(method))
                      .buttonStyle(buttonStyle)
                      .color(buttonColor)
                      .size(buttonSize)
                      .build());
            });
    return buttons;
  }
}
