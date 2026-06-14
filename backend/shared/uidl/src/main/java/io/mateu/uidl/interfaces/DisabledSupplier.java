package io.mateu.uidl.interfaces;

public interface DisabledSupplier {

  boolean isDisabled(String memberName, HttpRequest httpRequest);
}
