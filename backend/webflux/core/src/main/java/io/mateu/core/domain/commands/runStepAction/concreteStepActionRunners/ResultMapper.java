package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.URLWrapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.usecases.AllEditableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.ActionTarget;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.On;
import io.mateu.uidl.data.CloseModal;
import io.mateu.uidl.data.GoBack;
import io.mateu.uidl.interfaces.Container;
import io.mateu.uidl.interfaces.JourneyStarter;
import io.mateu.uidl.interfaces.Message;
import io.mateu.uidl.interfaces.ResponseWrapper;
import io.mateu.uidl.views.SingleComponentView;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ResultMapper {

  final ComponentFactory componentFactory;
  final UIIncrementFactory uIIncrementFactory;
  final BasicTypeChecker basicTypeChecker;
  final ViewMapper viewMapper;
  final DataExtractor dataExtractor;
  final AllEditableFieldsProvider allEditableFieldsProvider;
  final ReflectionService reflectionService;

  public ResultMapper(
      ComponentFactory componentFactory,
      UIIncrementFactory uIIncrementFactory,
      BasicTypeChecker basicTypeChecker,
      ViewMapper viewMapper,
      DataExtractor dataExtractor,
      AllEditableFieldsProvider allEditableFieldsProvider,
      ReflectionService reflectionService) {
    this.componentFactory = componentFactory;
    this.uIIncrementFactory = uIIncrementFactory;
    this.basicTypeChecker = basicTypeChecker;
    this.viewMapper = viewMapper;
    this.dataExtractor = dataExtractor;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
    this.reflectionService = reflectionService;
  }

  public Mono<UIIncrement> processResult(
      Object actualViewInstance,
      AnnotatedElement trigger,
      Method m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object result,
      String componentId,
      boolean calledByParametersEditor) {
    if (result == null) {
      return Mono.just(
          uIIncrementFactory.createForSingleComponent(
              componentFactory.createFormComponent(
                  actualViewInstance,
                  serverHttpRequest,
                  data,
                  mustAutofocusBeDisabled(m, calledByParametersEditor)),
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
              return getUiIncrement(
                  m, data, serverHttpRequest, r, componentId, calledByParametersEditor);
            } catch (Throwable e) {
              return Mono.error(new RuntimeException(e));
            }
          });

    } else {

      return Mono.just(
          getUiIncrement(
              trigger, data, serverHttpRequest, result, componentId, calledByParametersEditor));
    }
  }

  private boolean mustAutofocusBeDisabled(AnnotatedElement m, boolean calledByParametersEditor) {
    List<ActionTarget> modals =
        List.of(
            ActionTarget.NewModal,
            ActionTarget.LeftDrawer,
            ActionTarget.RightDrawer,
            ActionTarget.View);
    return !modals.contains(getActionTarget(m, calledByParametersEditor));
  }

  @SneakyThrows
  protected UIIncrement getUiIncrement(
      AnnotatedElement m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object r,
      String componentId,
      boolean calledByParametersEditor) {

    var commands = getCommands(m, data, serverHttpRequest, r, calledByParametersEditor);
    var messages = getMessages(r, m, calledByParametersEditor);
    var fragments =
        getFragments(m, data, serverHttpRequest, r, componentId, calledByParametersEditor);

    return new UIIncrement(commands, messages, fragments);
  }

  @SneakyThrows
  private List<UIFragment> getFragments(
      AnnotatedElement m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object r,
      String componentId,
      boolean calledByParametersEditor) {

    List<UIFragment> fragments = new ArrayList<>();
    if (mustCloseModal(m, r instanceof MethodParametersEditor) || r instanceof CloseModal) {
    } else if (isTargetMessage(m) || r instanceof Message || r instanceof io.mateu.dtos.Message) {

    } else if (r instanceof URL url) {
      if (!ActionTarget.NewTab.equals(getActionTarget(m, calledByParametersEditor))
          && !ActionTarget.NewWindow.equals(getActionTarget(m, calledByParametersEditor))) {
        var component =
            componentFactory.createFormComponent(
                new URLWrapper(url),
                serverHttpRequest,
                data,
                mustAutofocusBeDisabled(m, calledByParametersEditor));
        fragments.add(
            new UIFragment(
                mapActionTarget(getActionTarget(m, calledByParametersEditor)),
                getTargetId(m, componentId, calledByParametersEditor),
                getModalStyle(m),
                getModalTitle(m),
                new SingleComponent(component.id()),
                Map.of(component.id(), component)));
      }
    } else if (basicTypeChecker.isBasic(r.getClass())) {
      var component =
          componentFactory.createFormComponent(
              new ObjectWrapper(r),
              serverHttpRequest,
              data,
              mustAutofocusBeDisabled(m, calledByParametersEditor));
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m, calledByParametersEditor)),
              getTargetId(m, componentId, calledByParametersEditor),
              getModalStyle(m),
              getModalTitle(m),
              new SingleComponent(component.id()),
              Map.of(component.id(), component)));
    } else if (r instanceof ResponseWrapper responseWrapper) {
      var component =
          componentFactory.createFormComponent(
              responseWrapper.response(),
              serverHttpRequest,
              data,
              mustAutofocusBeDisabled(m, calledByParametersEditor));
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m, calledByParametersEditor)),
              getTargetId(m, componentId, calledByParametersEditor),
              getModalStyle(m),
              getModalTitle(m),
              new SingleComponent(component.id()),
              Map.of(component.id(), component)));
    } else if (r instanceof io.mateu.uidl.interfaces.View view) {
      Map<String, Component> allComponents = new LinkedHashMap<>();
      View viewDto = viewMapper.map(view, serverHttpRequest, allComponents, Map.of());
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m, calledByParametersEditor)),
              getTargetId(m, componentId, calledByParametersEditor),
              getModalStyle(m),
              getModalTitle(m),
              viewDto,
              allComponents));
    } else if (r instanceof Container) {
      Map<String, Component> allComponents = new LinkedHashMap<>();
      View viewDto =
          viewMapper.map(new SingleComponentView(r), serverHttpRequest, allComponents, Map.of());
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m, calledByParametersEditor)),
              getTargetId(m, componentId, calledByParametersEditor),
              getModalStyle(m),
              getModalTitle(m),
              viewDto,
              allComponents));
    } else {
      var component =
          componentFactory.createFormComponent(
              r, serverHttpRequest, data, mustAutofocusBeDisabled(m, calledByParametersEditor));
      fragments.add(
          new UIFragment(
              mapActionTarget(getActionTarget(m, calledByParametersEditor)),
              getTargetId(m, componentId, calledByParametersEditor),
              getModalStyle(m),
              getModalTitle(m),
              new SingleComponent(component.id()),
              Map.of(component.id(), component)));
    }

    return fragments;
  }

  private boolean isTargetMessage(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return ActionTarget.Message.equals(m.getAnnotation(MainAction.class).target());
    }
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return ActionTarget.Message.equals(
          m.getAnnotation(io.mateu.uidl.annotations.Action.class).target());
    }
    if (m.isAnnotationPresent(Button.class)) {
      return ActionTarget.Message.equals(m.getAnnotation(Button.class).target());
    }
    if (m.isAnnotationPresent(On.class)) {
      return ActionTarget.Message.equals(m.getAnnotation(On.class).target());
    }
    return false;
  }

  private List<UICommand> getCommands(
      AnnotatedElement m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      Object r,
      boolean calledByParametersEditor) {
    List<UICommand> commands = new ArrayList<>();
    if (mustCloseModal(m, r instanceof MethodParametersEditor)) {
      commands.add(
          createCloseCommand(
              m, r, dataExtractor.getData(r), serverHttpRequest, calledByParametersEditor));
    } else if (r instanceof CloseModal closeModal) {
      commands.add(
          createCloseCommand(
              m,
              closeModal,
              dataExtractor.getData(closeModal.getResult()),
              serverHttpRequest,
              calledByParametersEditor));
    }
    if (r instanceof URL url) {
      if (ActionTarget.NewTab.equals(getActionTarget(m, calledByParametersEditor))) {
        commands.add(new UICommand(UICommandType.OpenNewTab, url.toString()));
      }
      if (ActionTarget.NewWindow.equals(getActionTarget(m, calledByParametersEditor))) {
        commands.add(new UICommand(UICommandType.OpenNewWindow, url.toString()));
      }
    }
    return commands;
  }

  private UICommand createCloseCommand(
      AnnotatedElement m,
      Object r,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      boolean calledByParametersEditor) {
    CloseModal closeModal = null;
    if (r instanceof CloseModal<?>) {
      closeModal = (CloseModal<?>) r;
      r = closeModal.getResult();
    }
    var component =
        componentFactory.createFormComponent(
            r, serverHttpRequest, data, mustAutofocusBeDisabled(m, calledByParametersEditor));
    var uiIncrement =
        new UIIncrement(
            List.of(),
            List.of(),
            List.of(
                new UIFragment(
                    mapActionTargetForResult(m, r, closeModal, calledByParametersEditor),
                    getTargetId(m, null, calledByParametersEditor),
                    getModalStyle(m),
                    getModalTitle(m),
                    new SingleComponent(component.id()),
                    Map.of(component.id(), component))));
    return new UICommand(UICommandType.CloseModal, uiIncrement);
  }

  private io.mateu.dtos.ActionTarget mapActionTargetForResult(
      AnnotatedElement m, Object r, CloseModal closeModal, boolean calledByParametersEditor) {
    if (closeModal != null) {
      return mapActionTarget(closeModal.getActionTarget());
    }
    return mapActionTarget(getActionTarget(m, calledByParametersEditor));
  }

  private boolean mustCloseModal(AnnotatedElement m, boolean showingParametersEditor) {
    if (showingParametersEditor) {
      return false;
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).closeModalWindow();
    }
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).closeModalWindow();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).closeModalWindow();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).closeModalWindow();
    }
    return false;
  }

  protected String getModalStyle(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).modalStyle();
    }
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).modalStyle();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).modalStyle();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).modalStyle();
    }
    return null;
  }

  protected String getModalTitle(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).modalTitle();
    }
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).modalTitle();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).modalTitle();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).modalTitle();
    }
    return null;
  }

  protected String getTargetId(
      AnnotatedElement m, String componentId, boolean calledByParametersEditor) {
    if (ActionTarget.Self.equals(getActionTarget(m, calledByParametersEditor))) {
      return componentId;
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).targetId();
    }
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).targetId();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).targetId();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).targetId();
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

  protected ActionTarget getActionTarget(AnnotatedElement m, boolean calledByParametersEditor) {
    if (calledByParametersEditor) {
      return ActionTarget.Self;
    }
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).target();
    }
    if (m.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.uidl.annotations.Action.class).target();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).target();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).target();
    }
    return ActionTarget.Self;
  }

  private List<io.mateu.dtos.Message> getMessages(
      Object r, AnnotatedElement m, boolean calledByParametersEditor) {
    return extractMessages(r, m, calledByParametersEditor).stream()
        .map(
            msg ->
                new io.mateu.dtos.Message(
                    ResultType.valueOf(msg.type().name()), msg.title(), msg.text(), msg.duration()))
        .toList();
  }

  private List<Message> extractMessages(
      Object response, AnnotatedElement method, boolean calledByParametersEditor) {
    if (response instanceof Message) {
      return List.of((Message) response);
    }
    if (response instanceof List
        && Message.class.equals(reflectionService.getGenericClass(response.getClass()))) {
      return (List<Message>) response;
    }
    if (response instanceof ResponseWrapper) {
      return ((ResponseWrapper) response).messages();
    }
    if (ActionTarget.Message.equals(getActionTarget(method, calledByParametersEditor))) {
      return List.of(
          new Message(
              io.mateu.uidl.data.ResultType.valueOf(ResultType.Success.name()),
              "",
              "" + response,
              0));
    }
    if (response instanceof GoBack goBack) {
      if (ResultType.Ignored.equals(goBack.resultType()) || goBack.message() == null) {
        return List.of();
      }
      return List.of(new Message(goBack.resultType(), "", goBack.message(), 0));
    }
    return List.of();
  }
}
