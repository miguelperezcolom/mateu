package io.mateu.uidl.interfaces;

public interface LabelSupplier {

  String label(String memberName, HttpRequest httpRequest);
}
