package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record FaqDto(List<FaqItemDto> items) implements ComponentMetadataDto {

  public FaqDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<FaqItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
