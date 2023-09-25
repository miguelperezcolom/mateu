package io.mateu.mdd.shared.interfaces;

import java.util.List;

public class SelectedRowsContext {

  private static ThreadLocal<List> rows = new ThreadLocal<>();

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
