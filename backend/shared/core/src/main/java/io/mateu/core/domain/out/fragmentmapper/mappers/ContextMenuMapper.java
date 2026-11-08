package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;
import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ContextMenuDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ContextMenuMapper {

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

  /**
   * The options of a menu a page carries in its content (MenuBar, ContextMenu, Directory). A leaf
   * says what picking it does: a RouteLink its {@code route}, a MethodLink the {@code actionId} it
   * runs. Both used to be dropped — the option only carried a {@code path} made from its label, and
   * picking it did nothing.
   */
  protected static List<MenuOptionDto> buildMenu(
      List<Actionable> menu,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    // A freshly authored node (e.g. dropped from the visual editor's palette) has no menu yet.
    if (menu == null) return List.of();
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
                    .path(getPath(option))
                    .visible(true)
                    .selected(option.selected())
                    .disabled(option.disabled())
                    .disabledOnClick(option.disabledOnClick())
                    .className(option.className())
                    .itemData(option.itemData())
                    .route(option instanceof RouteLink routeLink ? routeLink.route() : null)
                    .actionId(
                        option instanceof MethodLink methodLink ? methodLink.methodName() : null)
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
