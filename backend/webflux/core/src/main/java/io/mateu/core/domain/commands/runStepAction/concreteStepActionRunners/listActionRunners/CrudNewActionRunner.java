package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.dtos.UIIncrement;
import io.mateu.uidl.interfaces.Crud;
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

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "new".equals(actionId.substring(actionId.lastIndexOf("__") + 2));
  }

  @Override
  public Mono<UIIncrement> run(
      Crud crud,
      String crudStepId,
      String actionId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Object editor = crud.getNewRecordForm();

    if (editor == null) {
      throw new Exception("Crud getNewRecordForm() returned null");
    }

    return Mono.just(
        uIIncrementFactory.createForSingleComponent(
            componentFactory.createFormComponent(editor, serverHttpRequest, data, false)));
  }
}
