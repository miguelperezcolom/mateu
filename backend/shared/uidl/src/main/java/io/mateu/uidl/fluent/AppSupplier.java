package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public interface AppSupplier extends ComponentTreeSupplier {

  @Override
  default Component getComponent(HttpRequest httpRequest) {
    return getApp(httpRequest);
  }

  App getApp(HttpRequest httpRequest);
}
