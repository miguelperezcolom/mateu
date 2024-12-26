package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.*;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.Button;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.stream.Collectors;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class RunButtonActionRunner extends RunMethodActionRunner implements ActionRunner {

  private final ValueProvider valueProvider;
  private final AllEditableFieldsProvider allEditableFieldsProvider;
  private final ResultMapper resultMapper;

  public RunButtonActionRunner(
      Merger merger,
      ActualValueExtractor actualValueExtractor,
      ReflectionService reflectionService,
      SerializerService serializerService,
      ValidationService validationService,
      ComponentFactory componentFactory,
      UIIncrementFactory uIIncrementFactory,
      BasicTypeChecker basicTypeChecker,
      MethodParametersEditorHandler methodParametersEditorHandler,
      MethodProvider methodProvider,
      ViewMapper viewMapper,
      ValueProvider valueProvider,
      DataExtractor dataExtractor,
      AllEditableFieldsProvider allEditableFieldsProvider,
      ManagedTypeChecker managedTypeChecker,
      ResultMapper resultMapper) {
    super(
        merger,
        actualValueExtractor,
        reflectionService,
        serializerService,
        validationService,
        componentFactory,
        uIIncrementFactory,
        methodParametersEditorHandler,
        methodProvider,
        managedTypeChecker,
        resultMapper);
    this.valueProvider = valueProvider;
    this.allEditableFieldsProvider = allEditableFieldsProvider;
    this.resultMapper = resultMapper;
  }

  @Override
  public boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData) {
    return getActions(viewInstance).containsKey(actionId);
  }

  private Map<Object, Field> getActions(Object viewInstance) {
    return reflectionService.getAllFields(viewInstance.getClass()).stream()
        .filter(m -> m.isAnnotationPresent(Button.class))
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

    Field m = getActions(viewInstance).get(actionId);

    return runMethod(viewInstance, m, data, serverHttpRequest, componentId);
  }

  public Mono<UIIncrement> runMethod(
      Object actualViewInstance,
      Field m,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest,
      String componentId)
      throws Throwable {

    {
      try {

        Object logicToRun = valueProvider.getValue(m, actualViewInstance);
        Object result = null;
        Method method = null;
        if (logicToRun instanceof Runnable runnable) {
          runnable.run();
          method = Runnable.class.getMethod("run");
        } else if (logicToRun instanceof Callable<?> callable) {
          result = callable.call();
          method = Callable.class.getMethod("call");
        }

        return resultMapper.processResult(
            actualViewInstance, m, method, data, serverHttpRequest, result, componentId, false);

      } catch (InvocationTargetException ex) {
        Throwable targetException = ex.getTargetException();
        System.out.println(
            targetException.getClass().getSimpleName() + ": " + targetException.getMessage());
        throw targetException;
      }
    }
  }
}
