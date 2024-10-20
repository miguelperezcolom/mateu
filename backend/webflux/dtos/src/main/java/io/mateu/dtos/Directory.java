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
public record Directory(String title, String subtitle, List<Menu> menu)
    implements ComponentMetadata {

  public Directory {
    menu = Collections.unmodifiableList(menu);
  }

  @Override
  public List<Menu> menu() {
    return Collections.unmodifiableList(menu);
  }
}
