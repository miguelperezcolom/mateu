package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class SplitCancelActionHandler implements CrudOrchestratorActionHandler {

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return false;
  }

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    return ("cancel-view".equals(actionId) || "cancel-new".equals(actionId))
        && orchestrator.getClass().isAnnotationPresent(SplitCrud.class);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    var fragment =
        UIFragmentDto.builder()
            .targetComponentId(httpRequest.runActionRq().initiatorComponentId())
            .data(Map.of("hasDetail", false))
            .build();

    orchestrator.setComponentRouteTo(httpRequest.runActionRq().consumedRoute());
    orchestrator.setRouteTo("/list");
    var pushState = UICommand.pushStateToHistory(orchestrator.pathForHistory("/list"));

    return List.of(fragment, pushState);
  }
}
