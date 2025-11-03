package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ContextMenuComponentToDtoMapper.buildMenu;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuBarDto;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.UUID;

public final class MenuBarComponentToDtoMapper {

  public static ClientSideComponentDto mapMenuBarToDto(
      MenuBar menuBar, String baseUrl, String route, HttpRequest httpRequest) {
    var menuDto =
        MenuBarDto.builder()
            .options(buildMenu(menuBar.options(), baseUrl, route, httpRequest))
            .build();
    return new ClientSideComponentDto(
        menuDto,
        UUID.randomUUID().toString(),
        List.of(),
        menuBar.style(),
        menuBar.cssClasses(),
        null);
  }
}
