package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A search form for a crud. It only contains a list of fields
 *
 * @param fields filters
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record SearchFormDto(List<FormFieldDto> fields) {

  public SearchFormDto {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<FormFieldDto> fields() {
    return Collections.unmodifiableList(fields);
  }
}
