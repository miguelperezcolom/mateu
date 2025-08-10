package io.mateu.uidl.data;

public record CrudlData(Page<?> page, String emptyStateMessage) {
  public CrudlData(Page<?> page) {
    this(page, null);
  }
}
