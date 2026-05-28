package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.AppMappingUtils.isSelected;
import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;

final class AppMenuDtoBuilder {

  static List<MenuOptionDto> buildMenu(AppShell app, String route, String appRoute) {
    return buildMenu(app, app.menu(), route, appRoute, "");
  }

  private static List<MenuOptionDto> buildMenu(
      AppShell app, List<Actionable> menu, String route, String appRoute, String prefix) {
    return menu.stream()
        .map(
            option -> {
              var path = getPath(prefix, option);
              return MenuOptionDto.builder()
                  .label(option.label())
                  .path(path)
                  .selected(isSelected(option, appRoute, route))
                  .visible(true)
                  .itemData(option.itemData())
                  .submenus(
                      option instanceof Menu asMenu
                          ? buildMenu(
                              app, asMenu.submenu(), route, appRoute, prefix + asMenu.path())
                          : List.of())
                  .separator(option instanceof MenuSeparator)
                  .remote(option instanceof RemoteMenu)
                  .baseUrl((option instanceof RemoteMenu remoteMenu) ? remoteMenu.baseUrl() : null)
                  .route(
                      (option instanceof RemoteMenu remoteMenu)
                          ? remoteMenu.route()
                          : appRoute + path)
                  .consumedRoute(
                      (option instanceof RemoteMenu remoteMenu)
                          ? remoteMenu.consumedRoute()
                          : appRoute)
                  .serverSideType(
                      (option instanceof RemoteMenu remoteMenu)
                          ? remoteMenu.serverSideType()
                          : app.serverSideType())
                  .params((option instanceof RemoteMenu remoteMenu) ? remoteMenu.params() : null)
                  .uriPrefix(appRoute)
                  .description(option.description())
                  .build();
            })
        .toList();
  }

  public static String getActionId(Actionable option) {
    if (option instanceof ContentLink contentLink) {
      return contentLink.path();
    }
    if (option instanceof FieldLink fieldLink) {
      return fieldLink.fieldName();
    }
    if (option instanceof MethodLink methodLink) {
      return methodLink.methodName();
    }
    return null;
  }

  private static String getPath(String appRoute, Actionable option) {
    if (option.path() == null) {
      return prepend(appRoute, toCamelCase(option.label()));
    }
    if (option instanceof RouteLink routeLink) {
      option = routeLink.withPath(prepend(appRoute, routeLink.path()));
    }
    if (option instanceof ContentLink contentLink) {
      option = contentLink.withPath(prepend(appRoute, contentLink.path()));
    }
    if (option instanceof FieldLink fieldLink) {
      option = fieldLink.withPath(prepend(appRoute, fieldLink.path()));
    }
    if (option instanceof MethodLink methodLink) {
      option = methodLink.withPath(prepend(appRoute, methodLink.path()));
    }
    if (option instanceof RemoteMenu remoteMenu) {
      option =
          remoteMenu.withPath(
              remoteMenu.path().startsWith(appRoute)
                  ? remoteMenu.path()
                  : prepend(appRoute, remoteMenu.path()));
    }
    return option.path();
  }

  public static String prepend(String appRoute, String path) {
    var prefix = appRoute.endsWith("/") ? appRoute.substring(0, appRoute.length() - 1) : appRoute;
    var suffix = path.startsWith("/") ? path.substring(1) : path;
    return prefix + "/" + suffix;
  }
}
