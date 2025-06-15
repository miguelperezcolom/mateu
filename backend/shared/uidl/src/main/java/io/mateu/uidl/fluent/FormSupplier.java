package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface FormSupplier extends ComponentSupplier {

  Form getForm(HttpRequest httpRequest);

}
