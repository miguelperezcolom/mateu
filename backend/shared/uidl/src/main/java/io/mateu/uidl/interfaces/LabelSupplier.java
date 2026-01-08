package io.mateu.uidl.interfaces;

public interface LabelSupplier {

  String label(Object id, HttpRequest httpRequest);
}
