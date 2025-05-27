package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface UISupplier {

  UI getUI(HttpRequest httpRequest);
}
