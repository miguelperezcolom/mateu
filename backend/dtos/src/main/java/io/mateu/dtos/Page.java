package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Page(List<Object> content, long totalElements) {
  public Page {
    content = Collections.unmodifiableList(content);
  }

  @Override
  public List<Object> content() {
    return Collections.unmodifiableList(content);
  }
}
