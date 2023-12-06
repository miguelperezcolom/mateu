package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
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
import io.mateu.util.Serializer;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

  final JourneyStoreService store;
  final Merger merger;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final ValidationService validationService;

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
                    reflectionHelper.setValue(entry.getKey(), actualInstance, actualValue);
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
        Object object = reflectionHelper.newInstance(objectEditor.getType());
        Object filled =
            serializer.fromJson(serializer.toJson(objectEditor.getData()), objectEditor.getType());
        reflectionHelper.copy(filled, object);
        var actualInstance = object;
        data.entrySet()
            .forEach(
                entry -> {
                  try {
                    Object actualValue = actualValueExtractor.getActualValue(entry, actualInstance);
                    reflectionHelper.setValue(entry.getKey(), actualInstance, actualValue);
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
    return reflectionHelper
        .getAllMethods(getActualInstance(viewInstance, Map.of()).getClass())
        .stream()
        .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
        .collect(Collectors.toMap(m -> m.getName(), m -> m));
  }

  @Override
  public Mono<Void> run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Object actualViewInstance = getActualInstance(viewInstance, data);

    Method m = getActions(actualViewInstance).get(actionId);

    return runMethod(actualViewInstance, m, journeyId, stepId, actionId, data, serverHttpRequest);
  }

  public Mono<Void> runMethod(
      Object actualViewInstance,
      Method m,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    // todo: inject parameters (ServerHttpRequest, selection for jpacrud)
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
                actualViewInstance,
                m.getName(),
                store.getCurrentStep(journeyId).getId(),
                serializer),
            serverHttpRequest);
      }

    } else {

      if (needsValidation(m)) {
        validationService.validate(actualViewInstance);
      }

      try {

        Object result = m.invoke(actualViewInstance, injectParameters(m, serverHttpRequest));

        if (result != null && Mono.class.isAssignableFrom(result.getClass())) {

          var mono = (Mono) result;

          return mono.map(
                  r -> {
                    try {
                      Object whatToShow = r;
                      if (!void.class.equals(m.getReturnType())) {
                        if (whatToShow instanceof Result) {
                          addBackDestination((Result) whatToShow, store.getInitialStep(journeyId));
                        }
                        String newStepId = "result_" + UUID.randomUUID().toString();
                        store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);
                      }
                    } catch (Throwable e) {
                      return Mono.error(new RuntimeException(e));
                    }
                    return Mono.empty();
                  })
              .then(
                  Mono.fromRunnable(
                      new Runnable() {
                        @Override
                        public void run() {
                          if (actualViewInstance != null
                              && !(actualViewInstance instanceof Listing)) {
                            try {
                              store.updateStep(journeyId, actualViewInstance, serverHttpRequest);
                            } catch (Throwable e) {
                              throw new RuntimeException(e);
                            }
                          }
                        }
                      }));
        } else {

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
        }

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            "" + targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }

    return Mono.empty();
  }

  private boolean needsValidation(Method m) {
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).validateBefore();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).validateBefore();
    }
    return false;
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
