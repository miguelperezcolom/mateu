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
    if (id == null) {
      id = idFromRoute(orchestrator, httpRequest);
    }
    return id;
  }

  /**
   * The record the request's route points at, {@code <crud>/<id>} or {@code <crud>/<id>/edit}.
   *
   * <p>The row's id field names a column of the listing, and the view or the editor need not have a
   * field of that name (an integration's row calls its hotel {@code crsHotel}, its view {@code
   * crsHotelCode}). Opened from the listing the id travels with the row; opened by its URL the only
   * place it is written is that URL — without this, Edit there went to {@code <crud>/null/edit}.
   */
  static String idFromRoute(Crud orchestrator, HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    if (rq == null || rq.route() == null) {
      return null;
    }
    var consumed = orchestrator.getConsumedRoute(httpRequest);
    if (consumed == null) {
      consumed = rq.consumedRoute();
    }
    if (consumed == null) {
      return null;
    }
    var route = rq.route();
    if (route.contains("?")) {
      route = route.substring(0, route.indexOf('?'));
    }
    if (!route.startsWith(consumed + "/")) {
      return null;
    }
    var record = route.substring(consumed.length() + 1);
    if (record.endsWith("/edit")) {
      record = record.substring(0, record.length() - "/edit".length());
    }
    if (record.isEmpty() || "new".equals(record) || "null".equals(record)) {
      return null;
    }
    return record;
  }
}
