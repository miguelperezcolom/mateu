package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A search form for a crud. It only contains a list of fields
 *
 * @param fields filters
 */
public record SearchFormDto(List<FormFieldDto> fields) {

  public SearchFormDto {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<FormFieldDto> fields() {
    return Collections.unmodifiableList(fields);
  }
}
