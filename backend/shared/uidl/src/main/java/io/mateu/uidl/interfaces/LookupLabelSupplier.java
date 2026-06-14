package io.mateu.uidl.interfaces;

public interface LookupLabelSupplier {

  String label(String fieldName, Object id, HttpRequest httpRequest);
}
