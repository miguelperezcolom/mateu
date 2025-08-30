package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record ClientSideComponentDto(
    ComponentMetadataDto metadata,
    String id,
    List<ComponentDto> children,
    String style,
    String cssClasses,
    String slot)
    implements ComponentDto {

  public ClientSideComponentDto {
    children = children != null ? Collections.unmodifiableList(children) : List.of();
  }

  @Override
  public List<ComponentDto> children() {
    return Collections.unmodifiableList(children);
  }

  @Override
  public ComponentDto setStyle(String style) {
    return new ClientSideComponentDto(metadata, id, children, style, cssClasses, slot);
  }

  @Override
  public ComponentDto setSlot(String slot) {
    return new ClientSideComponentDto(metadata, id, children, style, cssClasses, slot);
  }
}
