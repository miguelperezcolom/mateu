package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.ActionHandler;
import org.springframework.http.server.reactive.ServerHttpRequest;

public record CrudDeleteResultActionHandler(Crud crud) implements ActionHandler {

  @Override
  public Object handle(Object target, String actionId, ServerHttpRequest serverHttpRequest) {
    return crud;
  }
}
