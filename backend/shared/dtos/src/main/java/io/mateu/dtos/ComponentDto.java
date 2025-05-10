package io.mateu.dtos;


import java.util.Collections;
import java.util.List;

public record ComponentDto(
    ComponentMetadataDto metadata,
    String id,
    String className,
    List<PairDto> attributes,
    Object data,
    List<ComponentDto> children) {

  public ComponentDto {
    attributes = Collections.unmodifiableList(attributes);
    children = Collections.unmodifiableList(children);
  }

  @Override
  public List<PairDto> attributes() {
    return Collections.unmodifiableList(attributes);
  }

  @Override
  public List<ComponentDto> children() {
    return Collections.unmodifiableList(children);
  }
}
