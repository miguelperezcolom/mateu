package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import java.lang.reflect.Modifier;
import lombok.SneakyThrows;

final class WizardActionDispatcher {

  @SneakyThrows
  static Object dispatch(String actionId, Wizard wizard, HttpRequest httpRequest) {
    if (actionId.startsWith("search-")) {
      return WizardLookupHandler.handleSearch(actionId, wizard, httpRequest);
    }
    if ("next".equals(actionId)) {
      var stepField = wizard.currentStepField();
      setValue(
          stepField,
          wizard,
          MateuBeanProvider.getBean(InstanceFactory.class)
              .newInstance(
                  stepField.getType(), httpRequest.runActionRq().componentState(), httpRequest));
      // Branching: move to the next applicable non-result step (skipped steps don't apply given
      // the answers so far). The result step is only reached through the completion action.
      var next = wizard.nextApplicable(wizard.position);
      if (next >= 0) {
        wizard.position = next;
      }
    }
    if ("back".equals(actionId)) {
      wizard.position = wizard.previousApplicable(wizard.position);
    }
    if (!"".equals(actionId)) {
      var found =
          getAllMethods(wizard.getClass()).stream()
              .filter(method -> MetaAnnotations.isPresent(method, WizardCompletionAction.class))
              .filter(method -> actionId.equals(method.getName()))
              .findFirst();
      if (found.isPresent()) {

        var stepField = wizard.currentStepField();
        setValue(
            stepField,
            wizard,
            MateuBeanProvider.getBean(InstanceFactory.class)
                .newInstance(
                    stepField.getType(), httpRequest.runActionRq().componentState(), httpRequest));
        var method = found.get();
        if (!Modifier.isPublic(method.getModifiers())) {
          method.setAccessible(true);
        }
        var result = method.invoke(wizard);
        if (result != null) {
          return result;
        }
        wizard.position = wizard.numberOfSteps() - 1;
      }
    }
    return wizard;
  }

  private WizardActionDispatcher() {}
}
