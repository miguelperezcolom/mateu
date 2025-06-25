package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ContextMenuComponentToDtoMapper.buildMenu;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MenuBarDto;
import io.mateu.uidl.fluent.MenuBar;
import java.util.List;

public final class MenuBarComponentToDtoMapper {

  public static ComponentDto mapMenuBarToDto(MenuBar menuBar) {
    var menuDto = MenuBarDto.builder().options(buildMenu(menuBar.options())).build();
    return new ComponentDto(menuDto, "component_id", null, List.of());
  }
}
