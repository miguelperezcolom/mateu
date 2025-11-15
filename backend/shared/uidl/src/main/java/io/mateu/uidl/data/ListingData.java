package io.mateu.uidl.data;

import lombok.Builder;
import lombok.With;

@Builder
@With
public record ListingData<Row>(Page<Row> page, String emptyStateMessage) {
  public ListingData(Page<Row> page) {
    this(page, null);
  }
}
