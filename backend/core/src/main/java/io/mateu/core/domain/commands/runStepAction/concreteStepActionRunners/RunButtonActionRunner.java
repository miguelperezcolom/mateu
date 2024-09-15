package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.URLWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.ValueProvider;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.Button;
import io.mateu.core.domain.uidefinition.shared.data.CloseModal;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.*;
import java.lang.reflect.InvocationTargetException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunButtonActionRunner extends AbstractActionRunner implements ActionRunner {

  final Merger merger;
  final ActualValueExtractor actualValueExtractor;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final ValidationService validationService;
  private final ComponentFactory componentFactory;
  private final UIIncrementFactory uIIncrementFactory;
  private final BasicTypeChecker basicTypeChecker;
  private final ValueProvider valueProvider;

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    return getActions(viewInstance).containsKey(actionId);
  }

  private Map<Object, Field> getActions(Object viewInstance) {
    return reflectionHelper.getAllFields(viewInstance.getClass()).stream()
        .filter(m -> m.isAnnotationPresent(Button.class))
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

    Field m = getActions(viewInstance).get(actionId);

    return runMethod(viewInstance, m, data, serverHttpRequest);
  }

  public Mono<UIIncrement> runMethod(
      Object actualViewInstance,
      Field m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    {
      try {

        Object logicToRun = valueProvider.getValue(m, actualViewInstance);
        Object result = null;
        if (logicToRun instanceof Runnable runnable) {
          runnable.run();
        } else if (logicToRun instanceof Callable<?> callable) {
          result = callable.call();
        }

        if (result == null) {
          return Mono.just(
              uIIncrementFactory.createForSingleComponent(
                  componentFactory.createFormComponent(
                      actualViewInstance, serverHttpRequest, data)));
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

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }
  }

  private UIIncrement getUiIncrement(
      Field m, Map<String, Object> data, ServerHttpRequest serverHttpRequest, Object r) {
    if (r == null) {
      return new UIIncrement(List.of(), List.of(), List.of());
    }
    if (r
        instanceof
        io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter journeyStarter) {
      return new UIIncrement(
          List.of(
              new UICommand(
                  UICommandType.ReplaceJourney,
                  new io.mateu.dtos.JourneyStarter(
                      journeyStarter.uiId(),
                      journeyStarter.baseUrl(),
                      journeyStarter.journeyTypeId(),
                      journeyStarter.contextData()))),
          List.of(),
          List.of());
    }

    if (r instanceof CloseModal closeModal) {
      var component =
          componentFactory.createFormComponent(closeModal.getData(), serverHttpRequest, data);
      var uiIncrement =
          new UIIncrement(
              List.of(),
              getMessages(r, m),
              List.of(
                  new UIFragment(
                      mapActionTarget(getActionTarget(m)),
                      getTargetId(m),
                      getModalStyle(m),
                      new SingleComponent(component.id()),
                      Map.of(component.id(), component))));
      return new UIIncrement(
          List.of(new UICommand(UICommandType.CloseModal, uiIncrement)), List.of(), List.of());
    }
    if (r instanceof Message message) {
      return new UIIncrement(
          List.of(),
          List.of(
              new io.mateu.dtos.Message(
                  message.type(), message.title(), message.text(), message.duration())),
          List.of());
    }
    if (ActionTarget.Message.equals(getActionTarget(m))) {
      return new UIIncrement(
          List.of(),
          List.of(new io.mateu.dtos.Message(ResultType.Success, "" + r, null, 0)),
          List.of());
    }
    if (r instanceof URL url) {
      if (ActionTarget.NewTab.equals(getActionTarget(m))) {
        return new UIIncrement(
            List.of(new UICommand(UICommandType.OpenNewTab, url.toString())), List.of(), List.of());
      }
      if (ActionTarget.NewWindow.equals(getActionTarget(m))) {
        return new UIIncrement(
            List.of(new UICommand(UICommandType.OpenNewWindow, url.toString())),
            List.of(),
            List.of());
      }
      var component =
          componentFactory.createFormComponent(new URLWrapper(url), serverHttpRequest, data);
      return new UIIncrement(
          List.of(),
          List.of(),
          List.of(
              new UIFragment(
                  mapActionTarget(getActionTarget(m)),
                  getTargetId(m),
                  getModalStyle(m),
                  new SingleComponent(component.id()),
                  Map.of(component.id(), component))));
    }

    if (basicTypeChecker.isBasic(r.getClass())) {
      var component =
          componentFactory.createFormComponent(new ObjectWrapper(r), serverHttpRequest, data);
      return new UIIncrement(
          List.of(),
          List.of(),
          List.of(
              new UIFragment(
                  mapActionTarget(getActionTarget(m)),
                  getTargetId(m),
                  getModalStyle(m),
                  new SingleComponent(component.id()),
                  Map.of(component.id(), component))));
    }
    if (r instanceof ResponseWrapper responseWrapper) {
      var component =
          componentFactory.createFormComponent(
              responseWrapper.getResponse(), serverHttpRequest, data);
      return new UIIncrement(
          List.of(),
          responseWrapper.getMessages().stream()
              .map(
                  message ->
                      new io.mateu.dtos.Message(
                          message.type(), message.title(), message.text(), message.duration()))
              .toList(),
          List.of(
              new UIFragment(
                  mapActionTarget(getActionTarget(m)),
                  getTargetId(m),
                  getModalStyle(m),
                  new SingleComponent(component.id()),
                  Map.of(component.id(), component))));
    }
    var component = componentFactory.createFormComponent(r, serverHttpRequest, data);
    return new UIIncrement(
        List.of(),
        getMessages(r, m),
        List.of(
            new UIFragment(
                mapActionTarget(getActionTarget(m)),
                getTargetId(m),
                getModalStyle(m),
                new SingleComponent(component.id()),
                Map.of(component.id(), component))));
  }

  private String getModalStyle(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).modalStyle();
    }
    return null;
  }

  private String getTargetId(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).targetId();
    }
    return null;
  }

  private io.mateu.dtos.ActionTarget mapActionTarget(ActionTarget actionTarget) {
    if (actionTarget == null) {
      return null;
    }
    return io.mateu.dtos.ActionTarget.valueOf(actionTarget.name());
  }

  private ActionTarget getActionTarget(Field m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).target();
    }
    return null;
  }

  private List<io.mateu.dtos.Message> getMessages(Object r, Field m) {
    return extractMessages(r, m).stream()
        .map(msg -> new io.mateu.dtos.Message(msg.type(), msg.title(), msg.text(), msg.duration()))
        .toList();
  }

  private List<Message> extractMessages(Object response, Field method) {
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
    if (method.isAnnotationPresent(Button.class)
        && ActionTarget.Message.equals(method.getAnnotation(Button.class).target())) {
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
