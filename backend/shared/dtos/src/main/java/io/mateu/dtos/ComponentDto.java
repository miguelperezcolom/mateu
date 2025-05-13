package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record ComponentDto(
    ComponentMetadataDto metadata,
    String id,
    String serverSideType,
    List<ComponentDto> children) {

  public ComponentDto {
    children = Collections.unmodifiableList(children);
  }

  @Override
  public List<ComponentDto> children() {
    return Collections.unmodifiableList(children);
  }
}
