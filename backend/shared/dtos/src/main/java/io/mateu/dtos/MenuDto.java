package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Collections;
import java.util.List;

public record MenuDto(
    MenuTypeDto type,
    String icon,
    String caption,
    String journeyTypeId,
    List<MenuDto> submenus,
    @JsonIgnore int order,
    boolean visible,
    String remoteBaseUrl,
    String contextData) {

  public MenuDto {
    submenus = Collections.unmodifiableList(submenus);
  }

  @Override
  public List<MenuDto> submenus() {
    return Collections.unmodifiableList(submenus);
  }
}
