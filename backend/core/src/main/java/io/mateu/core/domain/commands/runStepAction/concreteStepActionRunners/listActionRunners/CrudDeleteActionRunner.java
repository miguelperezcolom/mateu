package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;
import io.mateu.dtos.JourneyContainer;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudDeleteActionRunner implements ListActionRunner {

  @Autowired JourneyContainerService store;
  @Autowired Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Crud crud, String actionId) {
    return "delete".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Crud crud,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    List selectedRows = (List) data.get("_selectedRows");

    if (selectedRows == null) {
      throw new Exception("No row selected");
    }

    try {
      List<Object> targetSet =
          new ArrayList<>(
              (Collection)
                  selectedRows.stream()
                      .map(
                          m -> {
                            try {
                              return crud.getRow((Map<String, Object>) m, serializer);
                            } catch (Throwable e) {
                              e.printStackTrace();
                            }
                            return null;
                          })
                      .collect(Collectors.toList()));
      crud.delete(targetSet);

      Result whatToShow =
          new Result(
              ResultType.Success,
              "" + selectedRows + " elements have been deleted",
              List.of(),
              new Destination(
                  DestinationType.ActionId,
                  "Back to " + store.getInitialStep(journeyContainer).getName(),
                  store.getInitialStep(journeyContainer).getId()),
              null);
      String newStepId = "result_" + UUID.randomUUID().toString();
      store.setStep(journeyContainer, newStepId, whatToShow, serverHttpRequest);

    } catch (Throwable e) {
      throw new Exception(
          "Crud delete thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    return Mono.empty();
  }
}
