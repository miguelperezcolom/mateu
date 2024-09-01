package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.URLWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.CloseModal;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
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
  private final BasicTypeChecker basicTypeChecker;
  private final MethodParametersEditorHandler methodParametersEditorHandler;
  private final MethodProvider methodProvider;
  private final ViewMapper viewMapper;

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    if (viewInstance instanceof MethodParametersEditor methodParametersEditor) {
      return methodParametersEditorHandler.handles(methodParametersEditor, actionId);
    }
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

    if (viewInstance instanceof MethodParametersEditor methodParametersEditor) {
      Object targetInstance =
          methodParametersEditorHandler.getTargetInstance(methodParametersEditor);
      Method m =
          methodProvider.getMethod(targetInstance.getClass(), methodParametersEditor.getMethodId());
      if (!Modifier.isPublic(m.getModifiers())) m.setAccessible(true);
      Object result = m.invoke(targetInstance, injectParameters(m, serverHttpRequest, data));
      return processResult(targetInstance, m, data, serverHttpRequest, result);
    }

    Method m = getActions(viewInstance).get(actionId);

    return runMethod(viewInstance, m, data, serverHttpRequest);
  }

  @SneakyThrows
  private Object[] injectParameters(
      Method m, ServerHttpRequest serverHttpRequest, Map<String, Object> data) {

    List<Object> values = new ArrayList<>();
    for (int i = 0; i < m.getParameterCount(); i++) {
      if (ServerHttpRequest.class.equals(m.getParameterTypes()[i])) {
        values.add(serverHttpRequest);
        continue;
      }
      values.add(
          actualValueExtractor.getActualValue(m.getParameterTypes()[i], data.get("param_" + i)));
    }
    return values.toArray();
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
            uIIncrementFactory.createForSingleComponent(
                componentFactory.createFormComponent(
                    new MethodParametersEditor(m.getDeclaringClass(), m.getName(), data),
                    serverHttpRequest,
                    data)));

      } else {

        return Mono.just(
            uIIncrementFactory.createForSingleComponent(
                componentFactory.createFormComponent(
                    new MethodParametersEditor(actualViewInstance, m.getName(), serializer),
                    serverHttpRequest,
                    data)));
      }

    } else {

      if (needsValidation(m)) {
        validationService.validate(actualViewInstance);
      }

      try {

        Object result = m.invoke(actualViewInstance, injectParameters(m, serverHttpRequest));

        return processResult(actualViewInstance, m, data, serverHttpRequest, result);

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }
  }

  private Mono processResult(
      Object actualViewInstance,
      Method m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object result) {
    if (result == null) {
      return Mono.just(
          uIIncrementFactory.createForSingleComponent(
              componentFactory.createFormComponent(actualViewInstance, serverHttpRequest, data)));
    }

    if (Mono.class.isAssignableFrom(result.getClass())) {

      var mono = (Mono) result;

      return mono.map(
          r -> {
            try {
              return getUiIncrement(m, data, serverHttpRequest, r);
            } catch (Throwable e) {
              return Mono.error(new RuntimeException(e));
            }
          });

    } else {

      return Mono.just(getUiIncrement(m, data, serverHttpRequest, result));
    }
  }

  @SneakyThrows
  private UIIncrement getUiIncrement(
      Method m, Map<String, Object> data, ServerHttpRequest serverHttpRequest, Object r) {
    if (r == null) {
      return new UIIncrement(List.of(), null, List.of(), Map.of());
    }
    if (r instanceof CloseModal closeModal) {
      var component =
          componentFactory.createFormComponent(closeModal.getData(), serverHttpRequest, data);
      var uiIncrement =
          new UIIncrement(
              List.of(),
              new SingleComponent(component.id()),
              getMessages(r, m),
              Map.of(component.id(), component));
      return new UIIncrement(
          List.of(new UICommand(UICommandType.CloseModal, uiIncrement)), null, List.of(), Map.of());
    }
    if (r instanceof Message message) {
      return new UIIncrement(
          List.of(),
          null,
          List.of(
              new io.mateu.dtos.Message(
                  message.type(), message.title(), message.text(), message.duration())),
          Map.of());
    }
    if (ActionTarget.Message.equals(getActionTarget(m))) {
      return new UIIncrement(
          List.of(),
          null,
          List.of(new io.mateu.dtos.Message(ResultType.Success, "" + r, null, 0)),
          Map.of());
    }
    if (r instanceof URL url) {
      if (ActionTarget.NewTab.equals(getActionTarget(m))) {
        return new UIIncrement(
            List.of(new UICommand(UICommandType.OpenNewTab, url.toString())),
            null,
            List.of(),
            Map.of());
      }
      if (ActionTarget.NewWindow.equals(getActionTarget(m))) {
        return new UIIncrement(
            List.of(new UICommand(UICommandType.OpenNewWindow, url.toString())),
            null,
            List.of(),
            Map.of());
      }
      var component =
          componentFactory.createFormComponent(new URLWrapper(url), serverHttpRequest, data);
      return new UIIncrement(
          List.of(),
          new SingleComponent(component.id()),
          List.of(),
          Map.of(component.id(), component));
    }

    if (basicTypeChecker.isBasic(r.getClass())) {
      var component =
          componentFactory.createFormComponent(new ObjectWrapper(r), serverHttpRequest, data);
      return new UIIncrement(
          List.of(),
          new SingleComponent(component.id()),
          List.of(),
          Map.of(component.id(), component));
    }
    if (r instanceof ResponseWrapper responseWrapper) {
      var component =
          componentFactory.createFormComponent(
              responseWrapper.getResponse(), serverHttpRequest, data);
      return new UIIncrement(
          List.of(),
          new SingleComponent(component.id()),
          responseWrapper.getMessages().stream()
              .map(
                  message ->
                      new io.mateu.dtos.Message(
                          message.type(), message.title(), message.text(), message.duration()))
              .toList(),
          Map.of(component.id(), component));
    }
    if (r instanceof Container) {
      Map<String, Component> allComponents = new LinkedHashMap<>();
      View view = viewMapper.map(r, serverHttpRequest, allComponents, Map.of());
      return new UIIncrement(List.of(), view, List.of(), allComponents);
    }
    var component = componentFactory.createFormComponent(r, serverHttpRequest, data);
    return new UIIncrement(
        List.of(),
        new SingleComponent(component.id()),
        getMessages(r, m),
        Map.of(component.id(), component));
  }

  private ActionTarget getActionTarget(Method m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).target();
    }
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).target();
    }
    return null;
  }

  private List<io.mateu.dtos.Message> getMessages(Object r, Method m) {
    return extractMessages(r, m).stream()
        .map(msg -> new io.mateu.dtos.Message(msg.type(), msg.title(), msg.text(), msg.duration()))
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
      return List.of(new Message(ResultType.Success, "", "" + response, 0));
    }
    if (method.isAnnotationPresent(MainAction.class)
        && ActionTarget.Message.equals(method.getAnnotation(MainAction.class).target())) {
      return List.of(new Message(ResultType.Success, "", "" + response, 0));
    }
    if (response instanceof GoBack goBack) {
      if (ResultType.Ignored.equals(goBack.getResultType()) || goBack.getMessage() == null) {
        return List.of();
      }
      return List.of(new Message(goBack.getResultType(), "", goBack.getMessage(), 0));
    }
    return List.of();
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
