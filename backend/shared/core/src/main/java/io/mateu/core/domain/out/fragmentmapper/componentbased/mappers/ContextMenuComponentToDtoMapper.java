package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.Humanizer.toCamelCase;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

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
      ContextMenu contextMenu,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new ContextMenuDto(
            buildMenu(
                contextMenu.menu(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest),
            mapComponentToDto(
                null,
                contextMenu.wrapped(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest),
            contextMenu.activateOnLeftClick()),
        "fieldId",
        List.of(),
        contextMenu.style(),
        contextMenu.cssClasses(),
        null);
  }

  protected static List<MenuOptionDto> buildMenu(
      List<Actionable> menu,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return menu.stream()
        .map(
            option ->
                MenuOptionDto.builder()
                    .label(option.label())
                    .component(
                        option.component() != null
                            ? mapComponentToDto(
                                null,
                                option.component(),
                                baseUrl,
                                route,
                                consumedRoute,
                                initiatorComponentId,
                                httpRequest)
                            : null)
                    .destination(
                        option instanceof RouteLink || option instanceof ContentLink
                            ? new GoToRouteDto("", getPath(option), null)
                            : null)
                    .visible(true)
                    .selected(option.selected())
                    .disabled(option.disabled())
                    .disabledOnClick(option.disabledOnClick())
                    .className(option.className())
                    .itemData(option.itemData())
                    .submenus(
                        option instanceof Menu asMenu
                            ? buildMenu(
                                asMenu.submenu(),
                                baseUrl,
                                route,
                                consumedRoute,
                                initiatorComponentId,
                                httpRequest)
                            : List.of())
                    .separator(option instanceof MenuSeparator)
                    .build())
        .toList();
  }

  private static String getPath(Actionable option) {
    if (option.path() == null) {
      return toCamelCase(option.label());
    }
    return option.path();
  }
}
