package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/**
 * Persists a single row edited in place in the listing grid (inline editing). The edited row
 * travels in the {@code _editedRow} action parameter.
 */
public class UpdateRowActionHandler implements CrudOrchestratorActionHandler {

  @Override
  public boolean supports(String actionId, HttpRequest httpRequest) {
    return "update-row".equals(actionId);
  }

  @Override
  @SuppressWarnings("unchecked")
  public Object handleAction(String actionId, HttpRequest httpRequest, Crud orchestrator) {
    if (!io.mateu.core.infra.declarative.orchestrators.crud.InlineEditingGate.offered(
        orchestrator)) {
      // the write behind inline editing exists only where the crud edits inline and lets the user
      // edit: anywhere else a crafted update-row is refused like an action that names nothing
      throw new io.mateu.core.application.security.MateuForbiddenException(
          "update-row: " + orchestrator.getClass().getName() + " does not edit rows inline");
    }
    // the gate passed: a repeated Idempotency-Key may now answer from memory
    io.mateu.core.infra.idempotency.IdempotencyKeys.checkpoint(httpRequest);
    var parameters = httpRequest.runActionRq().parameters();
    var row = parameters != null ? parameters.get("_editedRow") : null;
    if (!(row instanceof Map<?, ?> rowMap)) {
      // a crafted request, not a defect: said as written, no ERROR + stack per request
      throw new io.mateu.uidl.UserFacingException("update-row requires an _editedRow parameter");
    }
    io.mateu.core.infra.observability.RequestObservation.recordId(
        httpRequest, rowMap.get(orchestrator.getIdFieldForRow()));
    var editedField = parameters.get(EDITED_FIELD);
    var edited =
        onlyTheEditedCell(
            (Map<String, Object>) rowMap,
            editedField,
            orchestrator.getIdFieldForRow(),
            versionFieldOf(orchestrator));
    try {
      return orchestrator.updateRow(edited, httpRequest);
    } catch (
        io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.StaleEditException
            conflict) {
      // inline-edit conflict: same reload/overwrite dialog; Overwrite re-sends the SAME edited row
      // (the button's parameters merge into the action request), Reload re-runs the search
      var resend = new java.util.LinkedHashMap<String, Object>();
      resend.put("_editedRow", rowMap);
      if (editedField != null) {
        resend.put(EDITED_FIELD, editedField);
      }
      return io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.conflictDialog(
          "This row changed while you were editing it. Reload to see the changes or overwrite"
              + " them with your version.",
          "search",
          "update-row",
          resend,
          null,
          httpRequest);
    }
  }

  /** The action parameter naming the one cell the user edited (sent by the renderers since GA). */
  public static final String EDITED_FIELD = "_editedField";

  /**
   * The row an inline edit writes: when the request names the cell the user edited, ONLY that cell
   * (plus the row's id and version, which identify the record and guard it) — the row's other
   * values are the browser's copy of the listing, which a recycled grid cell once filled with
   * another row's values (3.0-beta.68), and the stored record keeps its own. A request naming no
   * cell (an older client) writes the row's cells as before.
   */
  public static Map<String, Object> onlyTheEditedCell(
      Map<String, Object> row, Object editedField, String idField, String versionField) {
    if (editedField == null) {
      return row;
    }
    if (!(editedField instanceof String field) || field.isBlank() || !row.containsKey(field)) {
      // a crafted request, not a defect: said as written
      throw new io.mateu.uidl.UserFacingException(
          "update-row: the edited cell is not in the edited row");
    }
    var cells = new java.util.LinkedHashMap<String, Object>();
    if (idField != null && row.containsKey(idField)) {
      cells.put(idField, row.get(idField));
    }
    if (versionField != null && row.containsKey(versionField)) {
      cells.put(versionField, row.get(versionField));
    }
    cells.put(field, row.get(field));
    return cells;
  }

  private static String versionFieldOf(Crud orchestrator) {
    var entity = orchestrator.entityClass();
    if (entity == null) {
      entity = orchestrator.rowClass();
    }
    return entity == null
        ? null
        : io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.versionField(entity)
            .map(java.lang.reflect.Field::getName)
            .orElse(null);
  }
}
