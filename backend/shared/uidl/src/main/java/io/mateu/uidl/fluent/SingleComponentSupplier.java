package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface SingleComponentSupplier extends ComponentSupplier {

  Component get(HttpRequest httpRequest);
}
