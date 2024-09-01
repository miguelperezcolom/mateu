package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A search form for a crud. It only contains a list of fields
 *
 * @param fields
 */
public record SearchForm(List<Field> fields) {

  public SearchForm {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<Field> fields() {
    return Collections.unmodifiableList(fields);
  }
}
