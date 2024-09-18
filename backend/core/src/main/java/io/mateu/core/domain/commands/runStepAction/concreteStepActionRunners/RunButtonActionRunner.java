package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.ObjectWrapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.URLWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.BasicTypeChecker;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.reflection.usecases.ValueProvider;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.core.interfaces.ResponseWrapper;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.annotations.Button;
import io.mateu.core.domain.uidefinition.shared.data.CloseModal;
import io.mateu.core.domain.uidefinition.shared.data.GoBack;
import io.mateu.dtos.*;

import java.lang.reflect.AnnotatedElement;
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
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunButtonActionRunner extends RunMethodActionRunner implements ActionRunner {

  private final ValueProvider valueProvider;

  public RunButtonActionRunner(Merger merger, ActualValueExtractor actualValueExtractor, ReflectionHelper reflectionHelper, Serializer serializer, ValidationService validationService, ComponentFactory componentFactory, UIIncrementFactory uIIncrementFactory, BasicTypeChecker basicTypeChecker, MethodParametersEditorHandler methodParametersEditorHandler, MethodProvider methodProvider, ViewMapper viewMapper, ValueProvider valueProvider, DataExtractor dataExtractor) {
    super(merger, actualValueExtractor, reflectionHelper, serializer, validationService, componentFactory, uIIncrementFactory, basicTypeChecker, methodParametersEditorHandler, methodProvider, viewMapper, dataExtractor);
      this.valueProvider = valueProvider;
  }

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
  @Override
  protected String getModalStyle(AnnotatedElement m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).modalStyle();
    }
    return null;
  }

  @Override
  protected String getTargetId(AnnotatedElement m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).targetId();
    }
    return null;
  }

  @Override
  protected ActionTarget getActionTarget(AnnotatedElement m) {
    if (m.isAnnotationPresent(Button.class)) {
      return m.getAnnotation(Button.class).target();
    }
    return null;
  }

}
