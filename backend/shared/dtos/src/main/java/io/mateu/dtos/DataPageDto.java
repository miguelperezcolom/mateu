package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record DataPageDto(List<Object> content, long totalElements) {
  public DataPageDto {
    content = Collections.unmodifiableList(content);
  }

  @Override
  public List<Object> content() {
    return Collections.unmodifiableList(content);
  }
}
