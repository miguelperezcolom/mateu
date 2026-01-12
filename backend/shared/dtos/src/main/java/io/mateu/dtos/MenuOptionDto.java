package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
public record MenuOptionDto(
    MenuTypeDto type,
    String icon,
    String label,
    ComponentDto component,
    GoToRouteDto destination,
    String actionId,
    List<MenuOptionDto> submenus,
    @JsonIgnore int order,
    boolean visible,
    boolean selected,
    boolean disabled,
    boolean disabledOnClick,
    String className,
    Object itemData,
    boolean separator,
    boolean remote,
    String baseUrl,
    String route,
    String consumedRoute,
    String appServerSideType,
    String serverSideType,
    Map<String, Object> params,
    boolean explode) {

  public MenuOptionDto {
    submenus = Collections.unmodifiableList(submenus != null ? submenus : Collections.emptyList());
  }

  @Override
  public List<MenuOptionDto> submenus() {
    return Collections.unmodifiableList(submenus);
  }
}
