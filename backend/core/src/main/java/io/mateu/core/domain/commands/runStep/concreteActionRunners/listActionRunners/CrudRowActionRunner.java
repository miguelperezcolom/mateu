package io.mateu.core.domain.commands.runStep.concreteActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStep.concreteActionRunners.ListActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.util.Helper;
import java.lang.reflect.Method;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudRowActionRunner implements ListActionRunner {

  @Autowired JourneyStoreService store;

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

      method.invoke(crud, Helper.fromJson(Helper.toJson(row), crud.getRowClass()));
    } catch (Throwable e) {
      throw new Exception(
          "Crud " + methodName + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    return Mono.empty();
  }
}