package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ResultMapper;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.Crud;
import java.lang.reflect.Method;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CrudNewActionRunner implements ListActionRunner {

  final ReflectionService reflectionService;
  final SerializerService serializerService;
  final FiltersDeserializer filtersDeserializer;
  final ComponentFactory componentFactory;
  private final UIIncrementFactory uIIncrementFactory;
  private final ResultMapper resultMapper;
  private final MethodProvider methodProvider;

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "new".equals(actionId.substring(actionId.lastIndexOf("__") + 2));
  }

  @Override
  public Mono<UIIncrementDto> run(
      Crud crud,
      String crudStepId,
      String actionId,
      String componentId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      String baseUrl,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Object editor = crud.getNewRecordForm();

    if (editor == null) {
      throw new Exception("Crud getNewRecordForm() returned null");
    }

    Method method = methodProvider.getMethod(crud.getClass(), "getNewRecordForm");

    return resultMapper.processResult(
        crud, method, method, data, baseUrl, serverHttpRequest, editor, componentId, false);
  }
}
