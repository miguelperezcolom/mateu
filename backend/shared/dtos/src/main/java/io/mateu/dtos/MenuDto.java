package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record MenuDto(
    MenuTypeDto type,
    String icon,
    String label,
    GoToRouteDto destination,
    List<MenuDto> submenus,
    @JsonIgnore int order,
    boolean visible,
    boolean selected) {

  public MenuDto {
    submenus = Collections.unmodifiableList(submenus != null ? submenus : Collections.emptyList());
  }

  @Override
  public List<MenuDto> submenus() {
    return Collections.unmodifiableList(submenus);
  }
}
