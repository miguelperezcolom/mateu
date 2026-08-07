package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;

final class WizardActionDispatcher {

  static Object dispatch(String actionId, Wizard wizard, HttpRequest httpRequest) {
    try {
      return dispatchInner(actionId, wizard, httpRequest);
    } catch (InvocationTargetException e) {
      // the @WizardCompletionAction method (user code) threw — surface its REAL cause, not the
      // reflective wrapper / the NoClassDefFoundError: lombok/Lombok that @SneakyThrows produced.
      var cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException re) {
        throw re;
      }
      if (cause instanceof Error err) {
        throw err;
      }
      throw new RuntimeException(cause);
    } catch (Exception e) {
      throw e instanceof RuntimeException re ? re : new RuntimeException(e);
    }
  }

  private static Object dispatchInner(String actionId, Wizard wizard, HttpRequest httpRequest)
      throws Exception {
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
    if ("goToStep".equals(actionId)) {
      // Clicking the drawer step pager jumps to an already-visited step (its field name arrives as
      // `_stepId`). Persist the current step first, then jump — only BACKWARD (target before the
      // current position), so we never skip the validation of the steps in between.
      var stepField = wizard.currentStepField();
      setValue(
          stepField,
          wizard,
          MateuBeanProvider.getBean(InstanceFactory.class)
              .newInstance(
                  stepField.getType(), httpRequest.runActionRq().componentState(), httpRequest));
      var params = httpRequest.runActionRq().parameters();
      var stepId = params != null ? params.get("_stepId") : null;
      if (stepId != null) {
        var fields = WizardStepInspector.getStepFields(wizard);
        for (int i = 0; i < fields.size() && i < wizard.position; i++) {
          if (fields.get(i).getName().equals(stepId.toString())) {
            wizard.position = i;
            break;
          }
        }
      }
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
