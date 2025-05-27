package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface AppSupplier extends ComponentSupplier {

  App getApp(HttpRequest httpRequest);
}
