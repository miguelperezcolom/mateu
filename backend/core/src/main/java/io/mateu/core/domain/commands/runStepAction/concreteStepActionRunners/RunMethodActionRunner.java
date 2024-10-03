package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.URLWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.usecases.AllEditableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.core.views.SingleComponentView;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.Button;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinition.shared.data.CloseModal;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter;
import io.mateu.dtos.*;
import java.lang.reflect.*;
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
  final ComponentFactory componentFactory;
  final UIIncrementFactory uIIncrementFactory;
  private final BasicTypeChecker basicTypeChecker;
  private final MethodParametersEditorHandler methodParametersEditorHandler;
  private final MethodProvider methodProvider;
  private final ViewMapper viewMapper;
  private final DataExtractor dataExtractor;
  private final AllEditableFieldsProvider allEditableFieldsProvider;

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
      String componentId,
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
      return processResult(targetInstance, m, data, serverHttpRequest, result, componentId);
    }

    Method m = getActions(viewInstance).get(actionId);

    return runMethod(viewInstance, m, data, serverHttpRequest, componentId);
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
      ServerHttpRequest serverHttpRequest,
      String componentId)
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

        return processResult(actualViewInstance, m, data, serverHttpRequest, result, componentId);

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
      Object result,
      String componentId) {
    if (result == null) {
      return Mono.just(
          uIIncrementFactory.createForSingleComponent(
              componentFactory.createFormComponent(actualViewInstance, serverHttpRequest, data),
              componentId));
    }

    if (result instanceof JourneyStarter journeyStarter) {
      return Mono.just(
          new UIIncrement(
              List.of(
                  new UICommand(
                      UICommandType.ReplaceJourney,
                      new io.mateu.dtos.JourneyStarter(
                          journeyStarter.uiId(),
                          journeyStarter.baseUrl(),
                          journeyStarter.journeyTypeId(),
                          journeyStarter.contextData()))),
              List.of(),
              List.of()));
    }

    if (Mono.class.isAssignableFrom(result.getClass())) {

      var mono = (Mono) result;

      return mono.map(
          r -> {
            try {
              return getUiIncrement(m, data, serverHttpRequest, r, componentId);
            } catch (Throwable e) {
              return Mono.error(new RuntimeException(e));
            }
          });

    } else {

      return Mono.just(getUiIncrement(m, data, serverHttpRequest, result, componentId));
    }
  }

  @SneakyThrows
  protected UIIncrement getUiIncrement(
      AnnotatedElement m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object r,
      String componentId) {

    var commands = getCommands(m, data, serverHttpRequest, r);
    var messages = getMessages(r, m);
    var fragments = getFragments(m, data, serverHttpRequest, r, componentId);

    return new UIIncrement(commands, messages, fragments);
  }

  @SneakyThrows
  private List<UIFragment> getFragments(
      AnnotatedElement m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object r,
      String componentId) {
    List<UIFragment> fragments = new ArrayList<>();
    if (mustCloseModal(m) || r instanceof CloseModal) {
    } else if (isTargetMessage(m) || r instanceof Message || r instanceof io.mateu.dtos.Message) {

    } else if (r instanceof URL url) {
      if (!ActionTarget.NewTab.equals(getActionTarget(m))
          && !ActionTarget.NewWindow.equals(getActionTarget(m))) {
        var component =
            componentFactory.createFormComponent(new URLWrapper(url), serverHttpRequest, data);
        fragments.add(
            new UIFragment(
                mapActionTarget(getActionTarget(m)),
                getTargetId(m, componentId),
                getModalStyle(m),
                new SingleComponent(component.id()),
                Map.of(component.id(), component)));
      }
    } else if (basicTypeChecker.isBasic(r.getClass())) {
      var component =
          componentFactory.createFormComponent(new ObjectWrapper(r), serverHttpRequest, data);
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m)),
              getTargetId(m, componentId),
              getModalStyle(m),
              new SingleComponent(component.id()),
              Map.of(component.id(), component)));
    } else if (r instanceof ResponseWrapper responseWrapper) {
      var component =
          componentFactory.createFormComponent(
              responseWrapper.getResponse(), serverHttpRequest, data);
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m)),
              getTargetId(m, componentId),
              getModalStyle(m),
              new SingleComponent(component.id()),
              Map.of(component.id(), component)));
    } else if (r instanceof io.mateu.core.domain.uidefinition.core.interfaces.View view) {
      Map<String, Component> allComponents = new LinkedHashMap<>();
      View viewDto = viewMapper.map(view, serverHttpRequest, allComponents, Map.of());
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m)),
              getTargetId(m, componentId),
              getModalStyle(m),
              viewDto,
              allComponents));
    } else if (r instanceof Container) {
      Map<String, Component> allComponents = new LinkedHashMap<>();
      View viewDto =
          viewMapper.map(new SingleComponentView(r), serverHttpRequest, allComponents, Map.of());
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m)),
              getTargetId(m, componentId),
              getModalStyle(m),
              viewDto,
              allComponents));
    } else {
      var component = componentFactory.createFormComponent(r, serverHttpRequest, data);
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m)),
              getTargetId(m, componentId),
              getModalStyle(m),
              new SingleComponent(component.id()),
              Map.of(component.id(), component)));
    }

    return fragments;
  }

  private boolean isTargetMessage(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return ActionTarget.Message.equals(m.getAnnotation(MainAction.class).target());
    }
    if (m.isAnnotationPresent(Action.class)) {
      return ActionTarget.Message.equals(m.getAnnotation(Action.class).target());
    }
    if (m.isAnnotationPresent(Button.class)) {
      return ActionTarget.Message.equals(m.getAnnotation(Button.class).target());
    }
    return false;
  }

  private List<UICommand> getCommands(
      AnnotatedElement m, Map<String, Object> data, ServerHttpRequest serverHttpRequest, Object r) {
    List<UICommand> commands = new ArrayList<>();
    if (mustCloseModal(m)) {
      commands.add(createCloseCommand(m, r, dataExtractor.getData(r), serverHttpRequest));
    } else if (r instanceof CloseModal closeModal) {
      commands.add(
          createCloseCommand(
              m,
              closeModal.getResult(),
              dataExtractor.getData(closeModal.getResult()),
              serverHttpRequest));
    }
    if (r instanceof URL url) {
      if (ActionTarget.NewTab.equals(getActionTarget(m))) {
        commands.add(new UICommand(UICommandType.OpenNewTab, url.toString()));
      }
      if (ActionTarget.NewWindow.equals(getActionTarget(m))) {
        commands.add(new UICommand(UICommandType.OpenNewWindow, url.toString()));
      }
    }
    return commands;
  }

  private UICommand createCloseCommand(
      AnnotatedElement m, Object r, Map<String, Object> data, ServerHttpRequest serverHttpRequest) {
    var component = componentFactory.createFormComponent(r, serverHttpRequest, data);
    var uiIncrement =
        new UIIncrement(
            List.of(),
            List.of(),
            List.of(
                new UIFragment(
                    mapActionTarget(getActionTarget(m)),
                    getTargetId(m, null),
                    getModalStyle(m),
                    new SingleComponent(component.id()),
                    Map.of(component.id(), component))));
    return new UICommand(UICommandType.CloseModal, uiIncrement);
  }

  private boolean mustCloseModal(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).closeModalWindow();
    }
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).closeModalWindow();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).closeModalWindow();
    }
    return false;
  }

  protected String getModalStyle(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).modalStyle();
    }
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).modalStyle();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).modalStyle();
    }
    return null;
  }

  protected String getTargetId(AnnotatedElement m, String componentId) {
    if (ActionTarget.Self.equals(getActionTarget(m))) {
      return componentId;
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).targetId();
    }
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).targetId();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).targetId();
    }
    return null;
  }

  private io.mateu.dtos.ActionTarget mapActionTarget(ActionTarget actionTarget) {
    if (actionTarget == null) {
      return null;
    }
    if (ActionTarget.Self.equals(actionTarget)) {
      return io.mateu.dtos.ActionTarget.Component;
    }
    return io.mateu.dtos.ActionTarget.valueOf(actionTarget.name());
  }

  protected ActionTarget getActionTarget(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).target();
    }
    if (m.isAnnotationPresent(Action.class)) {
      return m.getAnnotation(Action.class).target();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).target();
    }
    return null;
  }

  private List<io.mateu.dtos.Message> getMessages(Object r, AnnotatedElement m) {
    return extractMessages(r, m).stream()
        .map(msg -> new io.mateu.dtos.Message(msg.type(), msg.title(), msg.text(), msg.duration()))
        .toList();
  }

  private List<Message> extractMessages(Object response, AnnotatedElement method) {
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
    if (ActionTarget.Message.equals(getActionTarget(method))) {
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
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).validateBefore();
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
