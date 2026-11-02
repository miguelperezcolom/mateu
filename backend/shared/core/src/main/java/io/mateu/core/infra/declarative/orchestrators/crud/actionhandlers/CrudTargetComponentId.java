package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.core.infra.declarative.orchestrators.RoutedPage;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The client id of the crud's routed record page an action came from — the one its answer updates.
 *
 * <p>The page says it itself ({@link RoutedPage}, in the state its bubbled actions carry). The id
 * derived from the action's initiator is only a fallback for a page that did not say: it assumes
 * the crud is its app's home (the initiator being the crud's mediator, {@code <x>_app}) and names
 * nothing when the crud is, say, a menu entry of another app.
 */
final class CrudTargetComponentId {

  static String view(HttpRequest httpRequest) {
    var page = RoutedPage.id(httpRequest);
    return page != null ? page : withSuffix(httpRequest, "_cs_view");
  }

  /**
   * The routed edit / creation form: the page {@code MultiView.wrapView} names after its view
   * ({@code edit}, {@code new}), next to the record's view page.
   */
  static String form(HttpRequest httpRequest, boolean isCreation) {
    var page = RoutedPage.id(httpRequest);
    return page != null ? page : withSuffix(httpRequest, isCreation ? "_cs_new" : "_cs_edit");
  }

  private static String withSuffix(HttpRequest httpRequest, String suffix) {
    var id = httpRequest.runActionRq().initiatorComponentId();
    if (id.endsWith("_app")) {
      id = id.substring(0, id.length() - "_app".length());
    }
    return "ux_" + id + suffix;
  }

  private CrudTargetComponentId() {}
}
