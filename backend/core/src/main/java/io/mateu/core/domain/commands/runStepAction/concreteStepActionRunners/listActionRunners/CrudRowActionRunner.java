package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.util.Helper;
import java.lang.reflect.Method;
import java.util.Map;

import io.mateu.util.Serializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudRowActionRunner implements ListActionRunner {

  @Autowired JourneyStoreService store;
  @Autowired
  Serializer serializer;

  @Override
  public boolean applies(Crud crud, String actionId) {
    return actionId.startsWith("row__");
  }

  @Override
  public Mono<Void> run(
      Crud crud,
      String journeyId,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    Object row = data.get("_clickedRow");

    if (row == null) {
      throw new Exception("No row clicked");
    }

    String methodName = actionId.replaceAll("row__", "");
    try {

      Method method = crud.getClass().getMethod(methodName, crud.getRowClass());

      method.invoke(crud, serializer.fromJson(serializer.toJson(row), crud.getRowClass()));
    } catch (Throwable e) {
      throw new Exception(
          "Crud " + methodName + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    return Mono.empty();
  }
}