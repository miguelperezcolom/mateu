package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

final class CrudActionResultAssembler {

  static List<Object> assemble(
      CrudActionResult result,
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      HttpRequest httpRequest) {
    var list = new ArrayList<>();
    orchestrator.setRouteTo(result.route());
    list.add(new State(orchestrator));
    if (result.targetComponentId() != null) {
      httpRequest.setAttribute("targetComponentId", result.targetComponentId());
    }
    if (result.data() != null) {
      list.add(result.data());
    }
    if (result.state() != null) {
      list.add(result.state());
    }
    list.addAll(result.messages());
    if (result.actionToRun() != null) {
      list.add(
          UICommand.runAction(
              result.actionToRun(),
              result.targetComponentId() != null
                  ? result.targetComponentId()
                  : httpRequest.runActionRq().initiatorComponentId()));
    }
    list.add(UICommand.pushStateToHistory(orchestrator.pathForHistory(result.route())));
    list.add(orchestrator.setWindowTitle(httpRequest));
    return list;
  }
}
