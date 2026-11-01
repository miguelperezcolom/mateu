package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.uidl.interfaces.HttpRequest;

final class CrudTargetComponentId {

  static String view(HttpRequest httpRequest) {
    return withSuffix(httpRequest, "_cs_view");
  }

  /**
   * The routed edit / creation form: the page {@code MultiView.wrapView} names after its view
   * ({@code edit}, {@code new}), next to the record's view page.
   */
  static String form(HttpRequest httpRequest, boolean isCreation) {
    return withSuffix(httpRequest, isCreation ? "_cs_new" : "_cs_edit");
  }

  private static String withSuffix(HttpRequest httpRequest, String suffix) {
    var id = httpRequest.runActionRq().initiatorComponentId();
    return "ux_" + id.substring(0, id.length() - "_app".length()) + suffix;
  }

  private CrudTargetComponentId() {}
}
