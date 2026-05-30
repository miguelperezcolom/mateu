package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.core.infra.declarative.orchestrators.crud.routeresolvers.NewRouteResolver.createEditorComponent;

import io.mateu.core.infra.declarative.orchestrators.crud.CrudOrchestrator;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.annotations.SplitCrud;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class SplitNewActionHandler implements CrudOrchestratorActionHandler {

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return false;
  }

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    return "new".equals(actionId) && orchestrator.getClass().isAnnotationPresent(SplitCrud.class);
  }

  @Override
  public Object handleAction(
      String actionId, HttpRequest httpRequest, CrudOrchestrator orchestrator) {
    var editor = orchestrator.adapter().getCreationForm(httpRequest);
    var editorComponent = createEditorComponent(httpRequest, editor, orchestrator);

    var editorComponentDto =
        mapComponentToDto(
            null,
            editorComponent,
            "base_url",
            httpRequest.runActionRq().route(),
            httpRequest.runActionRq().consumedRoute(),
            httpRequest.runActionRq().initiatorComponentId(),
            httpRequest);

    var fragment =
        UIFragmentDto.builder()
            .targetComponentId(httpRequest.runActionRq().initiatorComponentId())
            .data(Map.of("hasDetail", true, "detailComponent", editorComponentDto))
            .build();

    orchestrator.setComponentRouteTo(httpRequest.runActionRq().consumedRoute());
    orchestrator.setRouteTo("/new");
    var pushState = UICommand.pushStateToHistory(orchestrator.pathForHistory("/new"));
    var windowTitle = orchestrator.setWindowTitle(httpRequest);

    return List.of(fragment, pushState, windowTitle);
  }
}
