package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.FieldStereotype;

public interface StereotypeSupplier {

  FieldStereotype stereotype(String memberName, HttpRequest httpRequest);
}
