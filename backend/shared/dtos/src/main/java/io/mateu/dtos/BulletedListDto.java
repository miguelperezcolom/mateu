package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record BulletedListDto(List<String> items) implements ComponentMetadataDto {

  public BulletedListDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<String> items() {
    return Collections.unmodifiableList(items);
  }
}
