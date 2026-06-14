package io.mateu.uidl.interfaces;

public interface ReadOnlySupplier {

  boolean isReadOnly(String memberName, HttpRequest httpRequest);
}
