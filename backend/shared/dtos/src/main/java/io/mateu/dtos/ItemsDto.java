package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record ItemsDto(List<ValueDto> content, long totalElements) {

  public ItemsDto {
    content = Collections.unmodifiableList(content);
  }

  @Override
  public List<ValueDto> content() {
    return Collections.unmodifiableList(content);
  }
}
