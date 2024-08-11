package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record FieldGroup(String id, String caption, List<FieldGroupLine> lines) {

  public FieldGroup {
    lines = Collections.unmodifiableList(lines);
  }

  @Override
  public List<FieldGroupLine> lines() {
    return Collections.unmodifiableList(lines);
  }
}
