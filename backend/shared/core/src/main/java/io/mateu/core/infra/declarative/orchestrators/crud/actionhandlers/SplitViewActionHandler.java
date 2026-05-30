package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.SplitListRouteResolver.createDetailComponent;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class SplitViewActionHandler implements CrudOrchestratorActionHandler {

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return false;
  }

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    return "view".equals(actionId) && orchestrator.getClass().isAnnotationPresent(SplitCrud.class);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    var idField = orchestrator.getIdFieldForRow();
    var selectedId = httpRequest.getComponentState(Map.class).get(idField);
    if (selectedId == null) {
      selectedId = httpRequest.runActionRq().parameters().get(idField);
    }

    var detailComponent = createDetailComponent(selectedId.toString(), httpRequest, orchestrator);
    var detailComponentDto =
        mapComponentToDto(
            null,
            detailComponent,
            "base_url",
            httpRequest.runActionRq().route(),
            httpRequest.runActionRq().consumedRoute(),
            httpRequest.runActionRq().initiatorComponentId(),
            httpRequest);

    var fragment =
        UIFragmentDto.builder()
            .targetComponentId(httpRequest.runActionRq().initiatorComponentId())
            .data(Map.of("hasDetail", true, "detailComponent", detailComponentDto))
            .build();

    orchestrator.setComponentRouteTo(httpRequest.runActionRq().consumedRoute());
    orchestrator.setRouteTo("/" + selectedId);
    var pushState = UICommand.pushStateToHistory(orchestrator.pathForHistory("/" + selectedId));
    var windowTitle = orchestrator.setWindowTitle(httpRequest);

    return List.of(fragment, pushState, windowTitle);
  }
}
