package io.mateu.core.domain.uidefinition.shared.interfaces;

import java.util.List;

public class SelectedRowsContext {

  // todo: do not use thread local for webflux
  private static final ThreadLocal<List> rows = new ThreadLocal<>();

  public SelectedRowsContext(List rows) {
    this.rows.set(rows);
  }

  public SelectedRowsContext() {}

  public List getRows() {
    return rows.get();
  }

  public void setRows(List rows) {
    this.rows.set(rows);
  }
}
