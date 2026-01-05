package io.mateu.uidl.interfaces;


public interface StateSupplier {

  Object state(HttpRequest httpRequest);
}
