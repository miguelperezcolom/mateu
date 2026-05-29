package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import java.lang.reflect.Modifier;
import lombok.SneakyThrows;

final class WizardActionDispatcher {

  @SneakyThrows
  static Object dispatch(String actionId, WizardOrchestrator wizard, HttpRequest httpRequest) {
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
      wizard.position++;
    }
    if ("back".equals(actionId)) {
      wizard.position--;
    }
    if (!"".equals(actionId)) {
      var found =
          getAllMethods(wizard.getClass()).stream()
              .filter(method -> method.isAnnotationPresent(WizardCompletionAction.class))
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
      }
    }
    return wizard;
  }

  private WizardActionDispatcher() {}
}
