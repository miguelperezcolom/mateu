package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.core.domain.commands.runStep.ActionRunner;
import io.mateu.core.domain.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.Listing;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class MainListActionRunnner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Autowired List<ListActionRunner> listActionRunners;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return actionId.startsWith("__list__");
  }

  @Override
  public void run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    String listId = "main";

    Listing rpcView;
    if (viewInstance instanceof Listing) {
      rpcView = (Listing) viewInstance;
    } else {
      listId = actionId.split("__")[2];
      rpcView = store.getRpcViewInstance(journeyId, stepId, listId, serverHttpRequest);
    }
    actionId = actionId.substring(actionId.indexOf("__") + 2);
    actionId = actionId.substring(actionId.indexOf("__") + 2);
    actionId = actionId.substring(actionId.indexOf("__") + 2);

    if (rpcView instanceof Crud) {
      Crud crud = (Crud) rpcView;

      for (ListActionRunner listActionRunner : listActionRunners) {
        if (listActionRunner.applies(crud, actionId)) {
          listActionRunner.run(crud, journeyId, stepId, listId, actionId, data, serverHttpRequest);
          break;
        }
      }
    }
  }
}
