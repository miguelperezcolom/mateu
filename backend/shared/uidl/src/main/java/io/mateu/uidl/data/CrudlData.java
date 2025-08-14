package io.mateu.uidl.data;

public record CrudlData<Row>(Page<Row> page, String emptyStateMessage) {
  public CrudlData(Page<Row> page) {
    this(page, null);
  }
}
