package io.mateu.uidl.data;

import io.mateu.uidl.fluent.SingleComponentSupplier;
import io.mateu.uidl.interfaces.Actionable;

public record ContentLink(
    String path, String label, SingleComponentSupplier componentSupplier, boolean selected)
    implements Actionable {

  public ContentLink(SingleComponentSupplier componentSupplier) {
    this(null, null, componentSupplier, false);
  }

  public ContentLink(String path, String label, SingleComponentSupplier componentSupplier) {
    this(path, label, componentSupplier, false);
  }
}
