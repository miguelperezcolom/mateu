package io.mateu.uidl.interfaces;

public interface LabelSupplier {

  String label(String fieldName, Object id, HttpRequest httpRequest);
}
