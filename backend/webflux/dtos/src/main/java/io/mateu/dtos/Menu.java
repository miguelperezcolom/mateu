package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Collections;
import java.util.List;

public record Menu(
    MenuType type,
    String icon,
    String caption,
    String journeyTypeId,
    List<Menu> submenus,
    @JsonIgnore int order,
    boolean visible,
    String remoteBaseUrl,
    String remoteUiId,
    String remoteMenuId) {

  public Menu {
    submenus = Collections.unmodifiableList(submenus);
  }

  @Override
  public List<Menu> submenus() {
    return Collections.unmodifiableList(submenus);
  }
}
