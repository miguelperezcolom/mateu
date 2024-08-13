package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.ResultType;
import io.mateu.dtos.Step;
import io.mateu.dtos.View;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final Merger merger;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final ValidationService validationService;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    if ("xxxbacktostep".equals(actionId)) {
      return true;
    }
    return getActions(journeyContainer, getActualInstance(journeyContainer, viewInstance, Map.of()))
        .containsKey(actionId);
  }

  private Object getActualInstance(
      JourneyContainer journeyContainer, Object viewInstance, Map<String, Object> data) {
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

  private Map<Object, Method> getActions(JourneyContainer journeyContainer, Object viewInstance) {
    return reflectionHelper
        .getAllMethods(getActualInstance(journeyContainer, viewInstance, Map.of()).getClass())
        .stream()
        .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
        .collect(Collectors.toMap(m -> m.getName(), m -> m));
  }

  @Override
  public Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    if ("xxxbacktostep".equals(actionId)) {
      return Mono.just(store.backToStep(journeyContainer, stepId));
    }

    Object actualViewInstance = getActualInstance(journeyContainer, viewInstance, data);

    Method m = getActions(journeyContainer, actualViewInstance).get(actionId);

    return runMethod(
        journeyContainer, actualViewInstance, m, stepId, actionId, data, serverHttpRequest);
  }

  public Mono<JourneyContainer> runMethod(
      JourneyContainer journeyContainer,
      Object actualViewInstance,
      Method m,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);

    journeyContainer = resetMessages(journeyContainer);

    // todo: inject parameters (ServerHttpRequest, selection for jpacrud)
    if (needsParameters(m)) {

      if (Modifier.isStatic(m.getModifiers())) {

        journeyContainer =
            store.setStep(
                journeyContainer,
                actionId,
                new MethodParametersEditor(
                    m.getDeclaringClass(),
                    m.getName(),
                    store.getCurrentStep(journeyContainer).id(),
                    data),
                serverHttpRequest,
                getTarget(m));

      } else {

        journeyContainer =
            store.setStep(
                journeyContainer,
                actionId,
                new MethodParametersEditor(
                    actualViewInstance,
                    m.getName(),
                    store.getCurrentStep(journeyContainer).id(),
                    serializer),
                serverHttpRequest,
                getTarget(m));
      }

    } else {

      if (needsValidation(m)) {
        validationService.validate(actualViewInstance);
      }

      try {

        Object result = m.invoke(actualViewInstance, injectParameters(m, serverHttpRequest));

        if (result != null && Mono.class.isAssignableFrom(result.getClass())) {

          var mono = (Mono) result;

          JourneyContainer finalJourneyContainer = journeyContainer;
          return mono.map(
              r -> {
                var jc = finalJourneyContainer;
                try {
                  // update the ui instance after running the method, as something has possibly
                  // changed
                  jc = updateStep(jc, actualViewInstance, serverHttpRequest, r);
                  // add a new step with the result
                  jc = processResponse(jc, m, r, serverHttpRequest);
                  jc = addMessages(jc, r, m);
                } catch (Throwable e) {
                  return Mono.error(new RuntimeException(e));
                }
                return Mono.just(jc);
              });
        } else {

          // update the ui instance after running the method, as something has possibly changed
          journeyContainer =
              updateStep(journeyContainer, actualViewInstance, serverHttpRequest, result);
          // add a new step with the result
          journeyContainer = processResponse(journeyContainer, m, result, serverHttpRequest);
          journeyContainer = addMessages(journeyContainer, result, m);
        }

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            "" + targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }

    return Mono.just(journeyContainer);
  }

  private JourneyContainer resetMessages(JourneyContainer journeyContainer) {
    var currentStepId = journeyContainer.journey().currentStepId();
    var step = journeyContainer.steps().get(currentStepId);
    var view = step.view();
    var steps = new HashMap<>(journeyContainer.steps());
    steps.put(
        currentStepId,
        new Step(
            step.id(),
            step.name(),
            step.type(),
            new View(
                view.title(),
                view.subtitle(),
                List.of(),
                view.header(),
                view.left(),
                view.main(),
                view.right(),
                view.footer()),
            step.data(),
            step.rules(),
            step.previousStepId(),
            step.target()));
    journeyContainer =
        new JourneyContainer(
            journeyContainer.journeyId(),
            journeyContainer.journeyTypeId(),
            journeyContainer.remoteBaseUrl(),
            journeyContainer.journeyClass(),
            journeyContainer.journeyData(),
            journeyContainer.journey(),
            steps,
            journeyContainer.initialStep(),
            journeyContainer.lastUsedFilters(),
            journeyContainer.lastUsedSorting());
    return journeyContainer;
  }

  private JourneyContainer addMessages(
      JourneyContainer journeyContainer, Object response, Method method) {
    List<Message> messages = extractMessages(response, method);
    try {
      var currentStepId = journeyContainer.journey().currentStepId();
      var step = journeyContainer.steps().get(currentStepId);
      var view = step.view();
      var steps = new HashMap<>(journeyContainer.steps());
      steps.put(
          currentStepId,
          new Step(
              step.id(),
              step.name(),
              step.type(),
              new View(
                  view.title(),
                  view.subtitle(),
                  mapMessages(messages),
                  view.header(),
                  view.left(),
                  view.main(),
                  view.right(),
                  view.footer()),
              step.data(),
              step.rules(),
              step.previousStepId(),
              step.target()));
      return new JourneyContainer(
          journeyContainer.journeyId(),
          journeyContainer.journeyTypeId(),
          journeyContainer.remoteBaseUrl(),
          journeyContainer.journeyClass(),
          journeyContainer.journeyData(),
          journeyContainer.journey(),
          steps,
          journeyContainer.initialStep(),
          journeyContainer.lastUsedFilters(),
          journeyContainer.lastUsedSorting());
    } catch (Throwable e) {
      throw new RuntimeException(e);
    }
  }

  private List<io.mateu.dtos.Message> mapMessages(List<Message> messages) {
    if (messages != null) {
      return messages.stream()
          .map(m -> new io.mateu.dtos.Message(m.getId(), m.getType(), m.getTitle(), m.getText()))
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
    if (response instanceof GoBack) {
      var goBack = (GoBack) response;
      return List.of(
          new Message(
              UUID.randomUUID().toString(), goBack.getResultType(), "", goBack.getMessage()));
    }
    return List.of();
  }

  private JourneyContainer updateStep(
      JourneyContainer journeyContainer,
      Object actualViewInstance,
      ServerHttpRequest serverHttpRequest,
      Object r) {
    if (actualViewInstance != null && !(actualViewInstance instanceof Listing)) {
      try {
        journeyContainer =
            store.updateStep(journeyContainer, actualViewInstance, serverHttpRequest);
      } catch (Throwable e) {
        throw new RuntimeException(e);
      }
    }
    return journeyContainer;
  }

  private JourneyContainer processResponse(
      JourneyContainer journeyContainer, Method m, Object r, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Object whatToShow = getActualResponse(r, m);
    if (whatToShow instanceof GoBack) {
      store.back(journeyContainer);
    } else if (needsToBeShown(m, r)) {
      if (whatToShow instanceof Result) {
        addBackDestination((Result) whatToShow, store.getInitialStep(journeyContainer));
      }
      String newStepId = "result_" + UUID.randomUUID().toString();
      journeyContainer =
          store.setStep(journeyContainer, newStepId, whatToShow, serverHttpRequest, getTarget(m));
    }
    if (ActionTarget.NewJourney.equals(getTarget(m))) {
      journeyContainer = store.deleteHistory(journeyContainer);
    }
    return journeyContainer;
  }

  private ActionTarget getTarget(Method m) {
    var target = ActionTarget.SameLane;
    if (m.isAnnotationPresent(Action.class)) {
      target = m.getAnnotation(Action.class).target();
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      target = m.getAnnotation(MainAction.class).target();
    }
    if (URL.class.equals(m.getReturnType())) {
      if (ActionTarget.NewTab.equals(target)) {
        target = ActionTarget.DeferredNewTab;
      } else if (ActionTarget.NewWindow.equals(target)) {
        target = ActionTarget.DeferredNewWindow;
      } else {
        target = ActionTarget.Deferred;
      }
    }
    return target;
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
