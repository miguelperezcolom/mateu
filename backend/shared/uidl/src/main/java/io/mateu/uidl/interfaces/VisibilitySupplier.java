package io.mateu.uidl.interfaces;

public interface VisibilitySupplier {

  boolean isHidden(String memberName, HttpRequest httpRequest);
}
