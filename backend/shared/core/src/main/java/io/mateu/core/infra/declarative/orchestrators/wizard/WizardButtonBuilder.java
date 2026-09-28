package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
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
      buttons.add(
          Button.builder()
              .id("back")
              // the action is "back" whatever the label says: without it the wire derived the
              // action from the label, and a localized "Atrás" sent "atrÁs", which no wizard knows
              .actionId("back")
              .label(wizard.backLabel(httpRequest))
              .disabled(wizard.position == 0)
              .build());
    }
    if (wizard.nextApplicable(wizard.position) >= 0) {
      // the step's way forward is the page's call to action, like the completion action below
      buttons.add(
          Button.builder()
              .id("next")
              .actionId("next")
              .label(wizard.nextLabel(httpRequest))
              .buttonStyle(ButtonStyle.primary)
              .build());
    } else if (!isLastStep) {
      getAllMethods(wizard.getClass()).stream()
          .filter(method -> MetaAnnotations.isPresent(method, WizardCompletionAction.class))
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
        .filter(method -> MetaAnnotations.isPresent(method, Toolbar.class))
        .filter(
            method ->
                !MetaAnnotations.isPresent(method, Hidden.class)
                    || !MetaAnnotations.find(method, Hidden.class).value().isEmpty())
        .filter(
            method ->
                !(step instanceof VisibilitySupplier vs)
                    || !vs.isHidden(method.getName(), httpRequest))
        .forEach(
            method -> {
              var ann = MetaAnnotations.find(method, Toolbar.class);
              var buttonStyle = ann.buttonStyle() != ButtonStyle.none ? ann.buttonStyle() : null;
              var buttonColor = ann.buttonColor() != ButtonColor.none ? ann.buttonColor() : null;
              var buttonSize =
                  ann.buttonSize() != ButtonSize.none ? ann.buttonSize() : ButtonSize.small;
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
