package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record DataPageDto(List<?> items, long totalElements) {
  public DataPageDto {
    items = Collections.unmodifiableList(items);
  }

  public List<?> items() {
    return Collections.unmodifiableList(items);
  }
}
