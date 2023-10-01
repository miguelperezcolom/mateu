package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.core.domain.commands.runStep.ActionRunner;
import io.mateu.core.domain.commands.runStep.ActualValueExtractor;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.MethodParametersEditor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.persistence.Merger;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Autowired Merger merger;

  @Autowired ActualValueExtractor actualValueExtractor;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return getActions(getActualInstance(viewInstance, Map.of())).containsKey(actionId);
  }

  private Object getActualInstance(Object viewInstance, Map<String, Object> data) {
    if (viewInstance instanceof EntityEditor) {
      try {
        EntityEditor entityEditor = ((EntityEditor) viewInstance);
        var actualInstance =
            merger.loadEntity(entityEditor.getData(), entityEditor.getEntityClass());
        data.entrySet()
            .forEach(
                entry -> {
                  try {
                    Object actualValue = actualValueExtractor.getActualValue(entry, actualInstance);
                    ReflectionHelper.setValue(entry.getKey(), actualInstance, actualValue);
                  } catch (Exception ex) {
                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                  }
                });
        return actualInstance;
      } catch (Exception e) {
        e.printStackTrace();
      }
      return null;
    }
    if (viewInstance instanceof ObjectEditor) {
      try {
        ObjectEditor objectEditor = ((ObjectEditor) viewInstance);
        Object object = ReflectionHelper.newInstance(objectEditor.getType());
        Object filled =
            Helper.fromJson(Helper.toJson(objectEditor.getData()), objectEditor.getType());
        ReflectionHelper.copy(filled, object);
        var actualInstance = object;
        data.entrySet()
            .forEach(
                entry -> {
                  try {
                    Object actualValue = actualValueExtractor.getActualValue(entry, actualInstance);
                    ReflectionHelper.setValue(entry.getKey(), actualInstance, actualValue);
                  } catch (Exception ex) {
                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                  }
                });
        return actualInstance;
      } catch (Exception e) {
        e.printStackTrace();
      }
      return null;
    }
    return viewInstance;
  }

  private Map<Object, Method> getActions(Object viewInstance) {
    return ReflectionHelper.getAllMethods(getActualInstance(viewInstance, Map.of()).getClass())
        .stream()
        .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
        .collect(Collectors.toMap(m -> m.getName(), m -> m));
  }

  @Override
  public void run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Object actualViewInstance = getActualInstance(viewInstance, data);

    Method m = getActions(actualViewInstance).get(actionId);

    runMethod(actualViewInstance, m, journeyId, stepId, actionId, data, serverHttpRequest);
  }

  protected void runMethod(
      Object actualViewInstance,
      Method m,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    // todo: inject paramneters (ServerHttpRequest, selection for jpacrud)
    if (needsParameters(m)) {

      if (Modifier.isStatic(m.getModifiers())) {

        store.setStep(
            journeyId,
            actionId,
            new MethodParametersEditor(
                m.getDeclaringClass(), m.getName(), store.getCurrentStep(journeyId).getId(), data),
            serverHttpRequest);

      } else {

        store.setStep(
            journeyId,
            actionId,
            new MethodParametersEditor(
                actualViewInstance, m.getName(), store.getCurrentStep(journeyId).getId()),
            serverHttpRequest);
      }

    } else {

      try {

        Object result = m.invoke(actualViewInstance, injectParameters(m, serverHttpRequest));

        if (actualViewInstance != null && !(actualViewInstance instanceof Listing)) {
          store.updateStep(journeyId, actualViewInstance, serverHttpRequest);
        }

        Object whatToShow = result;
        if (!void.class.equals(m.getReturnType())) {
          if (whatToShow instanceof Result) {
            addBackDestination((Result) whatToShow, store.getInitialStep(journeyId));
          }
          String newStepId = "result_" + UUID.randomUUID().toString();
          store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);
        }

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            "" + targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }
  }

  private Object[] injectParameters(Method m, ServerHttpRequest serverHttpRequest) {
    Object[] values = new Object[m.getParameterCount()];
    for (int i = 0; i < m.getParameters().length; i++) {
      Parameter parameter = m.getParameters()[i];
      Object value = null;
      if (ServerHttpRequest.class.equals(parameter.getType())) {
        value = serverHttpRequest;
      }
      values[i] = value;
    }
    return values;
  }

  private boolean needsParameters(Method m) {
    if (m.getParameterCount() == 0) return false;
    boolean anyNotInjected = false;
    for (Parameter parameter : m.getParameters()) {
      if (parameter.getType().equals(ServerHttpRequest.class)) {
        continue;
      }
      anyNotInjected = true;
    }
    return anyNotInjected;
  }
}
