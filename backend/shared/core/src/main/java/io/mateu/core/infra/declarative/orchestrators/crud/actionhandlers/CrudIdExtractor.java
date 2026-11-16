package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.RoutedPage;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/** Where a crud action finds the id of the record it works on. */
public class CrudIdExtractor {

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
      // the record page says which record it shows (its model need not hold the id)
      id = io.mateu.core.infra.declarative.orchestrators.RoutedPage.recordId(httpRequest);
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
  public static String idFromRoute(Crud orchestrator, HttpRequest httpRequest) {
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
    // An action of a record page (the editor's Save, the view's Edit) bubbles to an ancestor — the
    // app around the crud when the crud is a menu entry — which sends ITS route and consumed route.
    // The page itself says where the crud is mounted (its _pageRoute): measured against the app's
    // consumed route ("") instead, the crud's own segment was read as a record id — /products named
    // the record "products", and a save from the listing → row → Edit path was refused as "no
    // longer exists" (the app had not followed the in-crud navigation, so its route was still the
    // listing's).
    var pageRoute = RoutedPage.route(httpRequest);
    if (pageRoute != null
        && !pageRoute.isEmpty()
        && (route.equals(pageRoute) || route.startsWith(pageRoute + "/"))
        && pageRoute.startsWith(consumed)) {
      consumed = pageRoute;
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
