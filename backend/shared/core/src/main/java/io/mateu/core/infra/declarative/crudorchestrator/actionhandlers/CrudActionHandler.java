package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Strategy interface for handling a specific CRUD action. Each implementation handles one action id
 * (create, save, delete, cancel-edit, etc.)
 */
public interface CrudActionHandler {

  boolean supports(String actionId);

  CrudActionResult handle(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> orchestrator,
      CrudActionResult current,
      HttpRequest httpRequest);
}
