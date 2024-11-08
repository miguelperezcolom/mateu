package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.Crud;
import org.springframework.http.server.reactive.ServerHttpRequest;

public record CrudDeleteResultActionHandler(Crud crud) implements ActionHandler {

  @Override
  public Object handle(Object target, String actionId, ServerHttpRequest serverHttpRequest) {
    return crud;
  }
}
