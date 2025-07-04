package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * directory metadata
 *
 * @param title The directory title
 * @param subtitle The directory subtitle
 * @param menu The menus
 */
public record DirectoryDto(String title, String subtitle, List<MenuOptionDto> menu)
    implements ComponentMetadataDto {

  public DirectoryDto {
    menu = Collections.unmodifiableList(menu);
  }

  @Override
  public List<MenuOptionDto> menu() {
    return Collections.unmodifiableList(menu);
  }
}
