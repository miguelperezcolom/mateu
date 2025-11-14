package io.mateu.uidl.data;

public record ListingData<Row>(Page<Row> page, String emptyStateMessage) {
  public ListingData(Page<Row> page) {
    this(page, null);
  }
}
