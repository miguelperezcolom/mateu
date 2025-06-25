package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record MenuBarDto(List<MenuOptionDto> options) implements ComponentMetadataDto {

  public MenuBarDto {
    options = Collections.unmodifiableList(options != null ? options : List.of());
  }

  @Override
  public List<MenuOptionDto> options() {
    return Collections.unmodifiableList(options != null ? options : List.of());
  }
}
