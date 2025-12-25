package io.mateu.uidl.data;

import java.util.Arrays;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record ListingData<Row>(Page<Row> page, String emptyStateMessage) {
  public ListingData(Page<Row> page) {
    this(page, null);
  }

  public static <Row> ListingData<Row> from(List<Row> rows) {
    return new ListingData<>(new Page("", rows.size(), 0, rows.size(), rows));
  }

  public static <Row> ListingData<Row> of(Row... rows) {
    return new ListingData<>(
        new Page("", rows.length, 0, rows.length, Arrays.stream(rows).toList()));
  }

  public static <Row> ListingData<Row> of(List<Row> rows) {
    return new ListingData<>(
            new Page("", rows.size(), 0, rows.size(), rows));
  }
}
