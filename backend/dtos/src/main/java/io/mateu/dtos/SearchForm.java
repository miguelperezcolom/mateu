package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record SearchForm(List<Field> fields) {

  public SearchForm {
    fields = Collections.unmodifiableList(fields);
  }

  @Override
  public List<Field> fields() {
    return Collections.unmodifiableList(fields);
  }
}
