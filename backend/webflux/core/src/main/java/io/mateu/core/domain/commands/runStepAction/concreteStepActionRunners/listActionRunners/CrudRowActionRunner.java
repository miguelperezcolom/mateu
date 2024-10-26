package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import io.mateu.dtos.UIIncrement;
import java.lang.reflect.Method;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudRowActionRunner implements ListActionRunner {

  private final Serializer serializer;
  private final ComponentFactory componentFactory;
  private final UIIncrementFactory uIIncrementFactory;

  public CrudRowActionRunner(
      Serializer serializer,
      ComponentFactory componentFactory,
      UIIncrementFactory uIIncrementFactory) {
    this.serializer = serializer;
    this.componentFactory = componentFactory;
    this.uIIncrementFactory = uIIncrementFactory;
  }

  @Override
  public boolean applies(Crud crud, String actionId) {
    return actionId.contains("__row__");
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

    Object row = data.get("_clickedRow");

    if (row == null) {
      throw new Exception("No row clicked");
    }

    // todo: make reactive!

    String methodName = actionId.substring(actionId.indexOf("row__") + "row__".length());
    try {

      Method method = crud.getClass().getMethod(methodName, crud.getRowClass());
      var r = method.invoke(crud, serializer.fromJson(serializer.toJson(row), crud.getRowClass()));

      if (r == null) {
        return Mono.just(
            uIIncrementFactory.createForSingleComponent(
                componentFactory.createFormComponent(crud, serverHttpRequest, data)));
      }

      return Mono.just(
          uIIncrementFactory.createForSingleComponent(
              componentFactory.createFormComponent(r, serverHttpRequest, data)));

    } catch (Throwable e) {
      throw new Exception(
          "Crud " + methodName + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }
  }
}
