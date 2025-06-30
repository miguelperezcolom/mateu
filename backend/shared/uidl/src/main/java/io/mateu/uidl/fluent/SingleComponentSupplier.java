package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface SingleComponentSupplier {

  Component get(HttpRequest httpRequest);
}
