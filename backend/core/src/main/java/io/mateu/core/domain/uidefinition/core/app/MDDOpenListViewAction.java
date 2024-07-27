package io.mateu.core.domain.uidefinition.core.app;

import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import java.util.function.Supplier;

public class MDDOpenListViewAction extends AbstractAction {

  private final Class listViewClass;
  private final Supplier<Listing> supplier;
  private final Object selectedId;

  public MDDOpenListViewAction(String name, Class listViewClass) {
    this(name, listViewClass, null, null);
  }

  public MDDOpenListViewAction(String name, Supplier<Listing> supplier) {
    this(name, null, supplier, null);
  }

  public MDDOpenListViewAction(
      String name, Class listViewClass, Supplier<Listing> supplier, Object selectedId) {
    super(name);
    this.listViewClass = listViewClass;
    this.supplier = supplier;
    this.selectedId = selectedId;
  }

  public Class getListViewClass() {
    return listViewClass;
  }

  public Object getSelectedId() {
    return selectedId;
  }

  public Supplier<Listing> getSupplier() {
    return supplier;
  }
}
