package io.mateu.uidl.interfaces;

public interface RequiredSupplier {

  boolean isRequired(String memberName, HttpRequest httpRequest);
}
