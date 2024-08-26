package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.ResultType;
import io.mateu.dtos.SingleComponent;
import io.mateu.dtos.UIIncrement;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunMethodActionRunner extends AbstractActionRunner implements ActionRunner {

  final Merger merger;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final ValidationService validationService;
  private final ComponentFactory componentFactory;
  private final UIIncrementFactory uIIncrementFactory;

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    return getActions(viewInstance).containsKey(actionId);
  }

  private Map<Object, Method> getActions(Object viewInstance) {
    return reflectionHelper.getAllMethods(viewInstance.getClass()).stream()
        .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
        .collect(Collectors.toMap(m -> m.getName(), m -> m));
  }

  @Override
  public Mono<UIIncrement> run(
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Method m = getActions(viewInstance).get(actionId);

    return runMethod(viewInstance, m, data, serverHttpRequest);
  }

  public Mono<UIIncrement> runMethod(
      Object actualViewInstance,
      Method m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);

    // todo: inject parameters (ServerHttpRequest, selection for jpacrud)
    if (needsParameters(m)) {

      if (Modifier.isStatic(m.getModifiers())) {

        return Mono.just(
                uIIncrementFactory.createForSingleComponent(componentFactory.createFormComponent(
                        new MethodParametersEditor(m.getDeclaringClass(), m.getName(), data),
                        serverHttpRequest)));

      } else {

        return Mono.just(
                uIIncrementFactory.createForSingleComponent(componentFactory.createFormComponent(
                        new MethodParametersEditor(actualViewInstance, m.getName(), serializer),
                        serverHttpRequest)));
      }

    } else {

      if (needsValidation(m)) {
        validationService.validate(actualViewInstance);
      }

      try {

        Object result = m.invoke(actualViewInstance, injectParameters(m, serverHttpRequest));

        // todo: manage goback and callback!!!!

        if (result == null) {
          return Mono.just(
                  uIIncrementFactory.createForSingleComponent(componentFactory
                          .createFormComponent(actualViewInstance, serverHttpRequest)));
        }

        if (Mono.class.isAssignableFrom(result.getClass())) {

          var mono = (Mono) result;

          return mono.map(
              r -> {
                try {
                  var component = componentFactory.createFormComponent(r, serverHttpRequest);
                  return Mono.just(
                      new UIIncrement(
                          List.of(),
                          new SingleComponent(component.id()),
                          getMessages(r, m),
                          Map.of(component.id(), component)));
                } catch (Throwable e) {
                  return Mono.error(new RuntimeException(e));
                }
              });
        } else {

          var component = componentFactory.createFormComponent(result, serverHttpRequest);
          return Mono.just(
              new UIIncrement(
                  List.of(),
                  new SingleComponent(component.id()),
                  getMessages(result, m),
                  Map.of(component.id(), component)));
        }

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }
  }

  private List<io.mateu.dtos.Message> getMessages(Object r, Method m) {
    return extractMessages(r, m).stream()
        .map(msg -> new io.mateu.dtos.Message(msg.getType(), msg.getTitle(), msg.getText()))
        .toList();
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
      return List.of(new Message(ResultType.Success, "", "" + response));
    }
    if (method.isAnnotationPresent(MainAction.class)
        && ActionTarget.Message.equals(method.getAnnotation(MainAction.class).target())) {
      return List.of(new Message(ResultType.Success, "", "" + response));
    }
    if (response instanceof GoBack goBack) {
      if (ResultType.Ignored.equals(goBack.getResultType()) || goBack.getMessage() == null) {
        return List.of();
      }
      return List.of(new Message(goBack.getResultType(), "", goBack.getMessage()));
    }
    return List.of();
  }

  /*
  private Object processResponse(Method m, Object r, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Object whatToShow = getActualResponse(r, m);
    if (whatToShow instanceof GoBack goBack) {
      journeyContainer = store.back(journeyContainer);
      Object whereIGoBack =
          store.getViewInstance(
              journeyContainer, journeyContainer.journey().currentStepId(), serverHttpRequest);
      if (whereIGoBack instanceof HasCallback hasCallback) {
        hasCallback.callback(goBack, serverHttpRequest);
        journeyContainer = store.updateStep(journeyContainer, hasCallback, serverHttpRequest);
      }
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
   */

  private ActionTarget getTarget(Method m) {
    var target = ActionTarget.View;
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
