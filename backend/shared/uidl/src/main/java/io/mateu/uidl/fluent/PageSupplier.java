package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface PageSupplier extends ComponentSupplier {

  Page getPage(HttpRequest httpRequest);
}
