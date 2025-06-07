package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface CrudlSupplier extends ComponentSupplier {

  Crudl getCrudl(HttpRequest httpRequest);
}
