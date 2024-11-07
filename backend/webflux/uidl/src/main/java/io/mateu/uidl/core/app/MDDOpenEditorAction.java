package io.mateu.uidl.core.app;

import java.util.function.Supplier;

public class MDDOpenEditorAction extends AbstractAction {

  private final Class viewClass;
  private final Supplier<Object> supplier;

  public MDDOpenEditorAction(String name, Supplier<Object> supplier) {
    super(name);
    this.viewClass = null;
    this.supplier = supplier;
  }

  public Class getViewClass() {
    return supplier != null ? supplier.get().getClass() : viewClass;
  }

  public Supplier<Object> getSupplier() {
    return supplier;
  }
}
