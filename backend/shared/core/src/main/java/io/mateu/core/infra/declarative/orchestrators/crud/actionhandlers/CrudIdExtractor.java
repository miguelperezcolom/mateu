package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

class CrudIdExtractor {

  static Object extractId(Crud orchestrator, HttpRequest httpRequest) {
    var idField = orchestrator.getIdFieldForRow();
    var id = httpRequest.getComponentState(Map.class).get(idField);
    if (id == null) {
      id = httpRequest.runActionRq().parameters().get(idField);
    }
    if (id == null) {
      var initiatorState =
          (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
      if (initiatorState != null) {
        id = initiatorState.get(idField);
      }
    }
    return id;
  }
}
