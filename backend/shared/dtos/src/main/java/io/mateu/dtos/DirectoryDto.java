package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * directory metadata
 *
 * @param menu The menus
 */
public record DirectoryDto(List<MenuOptionDto> menu) implements ComponentMetadataDto {

  public DirectoryDto {
    menu = Collections.unmodifiableList(menu != null ? menu : List.of());
  }

  @Override
  public List<MenuOptionDto> menu() {
    return Collections.unmodifiableList(menu);
  }
}
