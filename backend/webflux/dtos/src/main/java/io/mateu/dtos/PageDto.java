package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record PageDto(List<Object> content, long totalElements) {
  public PageDto {
    content = Collections.unmodifiableList(content);
  }

  @Override
  public List<Object> content() {
    return Collections.unmodifiableList(content);
  }
}
