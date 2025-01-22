package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A search form for a crud. It only contains a list of fields
 *
 * @param fields
 */
public record SearchFormDto(List<FieldDto> fields) {

  public SearchFormDto {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<FieldDto> fields() {
    return Collections.unmodifiableList(fields);
  }
}
