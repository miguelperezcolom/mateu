package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import io.mateu.uidl.interfaces.HttpRequest;

final class CrudTargetComponentId {

  static String view(HttpRequest httpRequest) {
    return withSuffix(httpRequest, "_cs_view");
  }

  static String list(HttpRequest httpRequest) {
    return withSuffix(httpRequest, "_cs_list");
  }

  static String edit(HttpRequest httpRequest) {
    return withSuffix(httpRequest, "_cs_edit");
  }

  private static String withSuffix(HttpRequest httpRequest, String suffix) {
    var id = httpRequest.runActionRq().initiatorComponentId();
    return "ux_" + id.substring(0, id.length() - "_app".length()) + suffix;
  }

  private CrudTargetComponentId() {}
}
