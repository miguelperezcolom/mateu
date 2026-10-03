package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * One declared filter of a listing, as a URL query param.
 *
 * @param param the query param (the filter's field name); for a range, the field name, whose bounds
 *     go in {@code fromParam}/{@code toParam}
 * @param label what the filter bar calls it
 * @param type text | enum | boolean | number | date | dateTime | dateRange | numberRange
 * @param multiple an enum filter accepting several values, comma-joined ({@code a,b})
 * @param values the accepted values of an enum filter (its constant names)
 * @param fromParam a range's lower bound param ({@code <field>_from}), inclusive
 * @param toParam a range's upper bound param ({@code <field>_to}), inclusive
 */
@Builder
public record ListingFilterDto(
    String param,
    String label,
    String type,
    boolean multiple,
    List<String> values,
    String fromParam,
    String toParam) {

  public ListingFilterDto {
    values = Collections.unmodifiableList(values != null ? values : List.of());
  }
}
