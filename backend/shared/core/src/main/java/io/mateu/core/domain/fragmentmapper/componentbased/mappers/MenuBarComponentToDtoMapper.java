package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ContextMenuComponentToDtoMapper.buildMenu;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuBarDto;
import io.mateu.uidl.fluent.MenuBar;
import java.util.List;

public final class MenuBarComponentToDtoMapper {

  public static ClientSideComponentDto mapMenuBarToDto(MenuBar menuBar) {
    var menuDto = MenuBarDto.builder().options(buildMenu(menuBar.options())).build();
    return new ClientSideComponentDto(
        menuDto, "component_id", List.of(), menuBar.style(), menuBar.cssClasses());
  }
}
