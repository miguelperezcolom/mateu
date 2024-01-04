package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.MethodParametersEditor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.persistence.Merger;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.Message;
import io.mateu.mdd.core.interfaces.ResponseWrapper;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ActionTarget;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.ResultType;
import io.mateu.util.Serializer;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.ArrayList;
import java.util.List;
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
    if ("xxxbacktostep".equals(actionId)) {
      return true;
    }
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

    if ("xxxbacktostep".equals(actionId)) {
      store.backToStep(journeyId, stepId);

      return Mono.empty().then();
    }

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

    resetMessages(journeyId);

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

        List<Message> messages = new ArrayList<>();

        if (result != null && Mono.class.isAssignableFrom(result.getClass())) {

          var mono = (Mono) result;

          return mono.map(
              r -> {
                try {
                  // update the ui instance after running the method, as something has possibly
                  // changed
                  updateStep(journeyId, actualViewInstance, serverHttpRequest, r);
                  // add a new step with the result
                  processResponse(journeyId, m, r, serverHttpRequest);
                  addMessages(journeyId, r, m);
                } catch (Throwable e) {
                  return Mono.error(new RuntimeException(e));
                }
                return r;
              });
        } else {

          // update the ui instance after running the method, as something has possibly changed
          updateStep(journeyId, actualViewInstance, serverHttpRequest, result);
          // add a new step with the result
          processResponse(journeyId, m, result, serverHttpRequest);
          addMessages(journeyId, result, m);
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

  private void resetMessages(String journeyId) {
    var journeyContainer = store.findJourneyById(journeyId).get();
    var currentStepId = journeyContainer.getJourney().getCurrentStepId();
    var step = journeyContainer.getSteps().get(currentStepId);
    step.getView().setMessages(List.of());
    store.save(journeyContainer);
  }

  private void addMessages(String journeyId, Object response, Method method) {
    List<Message> messages = extractMessages(response, method);
    try {
      var journeyContainer = store.findJourneyById(journeyId).get();
      var currentStepId = journeyContainer.getJourney().getCurrentStepId();
      var step = journeyContainer.getSteps().get(currentStepId);
      step.getView().setMessages(mapMessages(messages));
      store.save(journeyContainer);
    } catch (Throwable e) {
      throw new RuntimeException(e);
    }
  }

  private List<io.mateu.remote.dtos.Message> mapMessages(
      List<io.mateu.mdd.core.interfaces.Message> messages) {
    if (messages != null) {
      return messages.stream()
          .map(
              m ->
                  new io.mateu.remote.dtos.Message(
                      m.getId(), m.getType(), m.getTitle(), m.getText()))
          .collect(Collectors.toList());
    } else {
      return List.of();
    }
  }

  private List<Message> extractMessages(Object response, Method method) {
    if (response instanceof Message) {
      return List.of((Message) response);
    }
    if (response instanceof List
        && Message.class.equals(reflectionHelper.getGenericClass(response.getClass()))) {
      return (List<Message>) response;
    }
    if (response instanceof ResponseWrapper) {
      return ((ResponseWrapper) response).getMessages();
    }
    if (method.isAnnotationPresent(Action.class)
        && ActionTarget.Message.equals(method.getAnnotation(Action.class).target())) {
      return List.of(
          new Message(UUID.randomUUID().toString(), ResultType.Success, "", "" + response));
    }
    if (method.isAnnotationPresent(MainAction.class)
        && ActionTarget.Message.equals(method.getAnnotation(MainAction.class).target())) {
      return List.of(
          new Message(UUID.randomUUID().toString(), ResultType.Success, "", "" + response));
    }
    return List.of();
  }

  private void updateStep(
      String journeyId, Object actualViewInstance, ServerHttpRequest serverHttpRequest, Object r) {
    if (actualViewInstance != null && !(actualViewInstance instanceof Listing)) {
      try {
        store.updateStep(journeyId, actualViewInstance, serverHttpRequest);
      } catch (Throwable e) {
        throw new RuntimeException(e);
      }
    }
  }

  private void processResponse(
      String journeyId, Method m, Object r, ServerHttpRequest serverHttpRequest) throws Throwable {
    Object whatToShow = getActualResponse(r, m);
    if (needsToBeShown(m, r)) {
      if (whatToShow instanceof Result) {
        addBackDestination((Result) whatToShow, store.getInitialStep(journeyId));
      }
      String newStepId = "result_" + UUID.randomUUID().toString();
      store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);
    }
  }

  private boolean needsToBeShown(Method m, Object r) {
    return !void.class.equals(m.getReturnType())
        && !Message.class.equals(m.getReturnType())
        && (!(m.isAnnotationPresent(Action.class)
                && ActionTarget.Message.equals(m.getAnnotation(Action.class).target()))
            && !(m.isAnnotationPresent(MainAction.class)
                && ActionTarget.Message.equals(m.getAnnotation(MainAction.class).target())))
        && (!List.class.isAssignableFrom(m.getReturnType())
            || !Message.class.equals(reflectionHelper.getGenericClass(m.getGenericReturnType())));
  }

  private Object getActualResponse(Object r, Method m) {
    if (r == null) {
      return r;
    }
    if (r instanceof ResponseWrapper) {
      return ((ResponseWrapper) r).getResponse();
    }
    if (r instanceof Message) {
      return null;
    }
    if (r instanceof List && Message.class.equals(reflectionHelper.getGenericClass(r.getClass()))) {
      return null;
    }
    if ((m.isAnnotationPresent(Action.class)
            && ActionTarget.Message.equals(m.getAnnotation(Action.class).target()))
        || (m.isAnnotationPresent(MainAction.class)
            && ActionTarget.Message.equals(m.getAnnotation(MainAction.class).target()))) {
      return null;
    }
    return r;
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
