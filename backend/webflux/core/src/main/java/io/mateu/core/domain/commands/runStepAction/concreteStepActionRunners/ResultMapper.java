package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.URLWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.usecases.AllEditableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Container;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Message;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinitionlanguage.core.views.SingleComponentView;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Button;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MainAction;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.On;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.CloseModal;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.GoBack;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.JourneyStarter;
import io.mateu.dtos.*;
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
  final ReflectionHelper reflectionHelper;

  public ResultMapper(
      ComponentFactory componentFactory,
      UIIncrementFactory uIIncrementFactory,
      BasicTypeChecker basicTypeChecker,
      ViewMapper viewMapper,
      DataExtractor dataExtractor,
      AllEditableFieldsProvider allEditableFieldsProvider,
      ReflectionHelper reflectionHelper) {
    this.componentFactory = componentFactory;
    this.uIIncrementFactory = uIIncrementFactory;
    this.basicTypeChecker = basicTypeChecker;
    this.viewMapper = viewMapper;
    this.dataExtractor = dataExtractor;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
    this.reflectionHelper = reflectionHelper;
  }

  public Mono<UIIncrement> processResult(
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
    } else if (r instanceof io.mateu.core.domain.uidefinitionlanguage.core.interfaces.View view) {
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
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)) {
      return ActionTarget.Message.equals(
          m.getAnnotation(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)
              .target());
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
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)
          .closeModalWindow();
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
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)
          .modalStyle();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).modalStyle();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).modalStyle();
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
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)
          .targetId();
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

  protected ActionTarget getActionTarget(AnnotatedElement m) {
    if (m.isAnnotationPresent(MainAction.class)) {
      return m.getAnnotation(MainAction.class).target();
    }
    if (m.isAnnotationPresent(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)) {
      return m.getAnnotation(io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Action.class)
          .target();
    }
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).target();
    }
    if (m.isAnnotationPresent(On.class)) {
      return m.getAnnotation(On.class).target();
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
}
