package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;

public record ContentLink(
    String path, String label, ComponentTreeSupplier componentSupplier, boolean selected)
    implements Actionable {

  public ContentLink(ComponentTreeSupplier componentSupplier) {
    this(null, null, componentSupplier, false);
  }

  public ContentLink(String path, String label, ComponentTreeSupplier componentSupplier) {
    this(path, label, componentSupplier, false);
  }
}
