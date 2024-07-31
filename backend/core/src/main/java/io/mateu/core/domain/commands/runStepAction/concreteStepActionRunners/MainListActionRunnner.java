package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.JourneyContainer;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class MainListActionRunnner implements ActionRunner {

  @Autowired JourneyContainerService store;

  @Autowired List<ListActionRunner> listActionRunners;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith("__list__");
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
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
      rpcView = store.getRpcViewInstance(journeyContainer, stepId, listId, serverHttpRequest);
    }
    actionId = actionId.substring(actionId.indexOf("__") + 2);
    actionId = actionId.substring(actionId.indexOf("__") + 2);
    actionId = actionId.substring(actionId.indexOf("__") + 2);

    if (rpcView instanceof Crud) {
      Crud crud = (Crud) rpcView;

      for (ListActionRunner listActionRunner : listActionRunners) {
        if (listActionRunner.applies(journeyContainer, crud, actionId)) {
          listActionRunner.run(
              journeyContainer, crud, stepId, listId, actionId, data, serverHttpRequest);
          break;
        }
      }
    }

    return Mono.empty();
  }
}
