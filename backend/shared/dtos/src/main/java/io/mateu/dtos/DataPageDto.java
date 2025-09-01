package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record DataPageDto(List<?> content, long totalElements) {
  public DataPageDto {
    content = Collections.unmodifiableList(content);
  }

  public List<?> content() {
    return Collections.unmodifiableList(content);
  }
}
