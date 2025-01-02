package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A field group line containing several fields
 *
 * @param fields The fields in this line
 */
public record FieldGroupLineDto(List<FieldDto> fields) {

  public FieldGroupLineDto {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<FieldDto> fields() {
    return Collections.unmodifiableList(fields);
  }
}
