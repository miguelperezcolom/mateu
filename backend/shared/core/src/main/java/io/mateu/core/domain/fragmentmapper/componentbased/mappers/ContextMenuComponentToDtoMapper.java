package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ContextMenuDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ContextMenuComponentToDtoMapper {

  public static ClientSideComponentDto mapContextMenuToDto(
      ContextMenu contextMenu, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new ContextMenuDto(
            buildMenu(contextMenu.menu()),
            mapComponentToDto(null, contextMenu.wrapped(), baseUrl, route, httpRequest)),
        "fieldId",
        List.of(),
        contextMenu.style(),
        contextMenu.cssClasses());
  }

  protected static List<MenuOptionDto> buildMenu(List<Actionable> menu) {
    return menu.stream()
        .map(
            option ->
                MenuOptionDto.builder()
                    .label(option.label())
                    .destination(
                        option instanceof RouteLink || option instanceof ContentLink
                            ? new GoToRouteDto("", getPath(option), null)
                            : null)
                    .visible(true)
                    .submenus(
                        option instanceof Menu asMenu ? buildMenu(asMenu.submenu()) : List.of())
                    .separator(option instanceof MenuSeparator)
                    .build())
        .toList();
  }

  private static String getPath(Actionable option) {
    if (option.path() == null) {
      return camelcasize(option.label());
    }
    return option.path();
  }
}
