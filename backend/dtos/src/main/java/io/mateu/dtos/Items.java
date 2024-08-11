package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record Items(List<Value> content, long totalElements) {

  public Items {
    content = Collections.unmodifiableList(content);
  }

  @Override
  public List<Value> content() {
    return Collections.unmodifiableList(content);
  }
}
