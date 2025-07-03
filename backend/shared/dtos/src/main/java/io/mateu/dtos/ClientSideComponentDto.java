package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record ClientSideComponentDto(
    ComponentMetadataDto metadata,
    String id,
    List<ComponentDto> children,
    String style,
    String cssClasses)
    implements ComponentDto {

  public ClientSideComponentDto {
    children = Collections.unmodifiableList(children);
  }

  @Override
  public List<ComponentDto> children() {
    return Collections.unmodifiableList(children);
  }
}
