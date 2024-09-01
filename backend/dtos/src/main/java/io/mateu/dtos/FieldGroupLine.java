package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A field group line containing several fields
 *
 * @param fields The fields in this line
 */
public record FieldGroupLine(List<Field> fields) {

  public FieldGroupLine {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<Field> fields() {
    return Collections.unmodifiableList(fields);
  }
}
