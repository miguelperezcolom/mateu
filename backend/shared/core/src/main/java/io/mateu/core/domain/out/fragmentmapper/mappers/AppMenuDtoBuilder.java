package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.AppMappingUtils.isSelected;
import static io.mateu.uidl.Humanizer.toCamelCase;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.RuleLink;
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
              var remote = option instanceof RemoteMenu remoteMenu ? remoteMenu : null;
              return MenuOptionDto.builder()
                  .label(remote != null ? remoteLabel(remote, path) : option.label())
                  .shellLabel(remote != null && hasText(remote.label()))
                  .routePrefix(remote != null ? remoteRoutePrefix(remote, path) : null)
                  .icon(option.icon())
                  .path(path)
                  .selected(isSelected(option, appRoute, route))
                  // a hidden entry still travels: the renderer needs to know where its routes
                  // live (deep links, reloads), and leaves it out of the menu it draws
                  .visible(!option.hidden())
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
                  .rules(
                      (option instanceof RuleLink ruleLink)
                          ? ruleLink.rules().stream().map(RuleMapper::mapToRule).toList()
                          : List.of())
                  .uriPrefix(appRoute)
                  .description(option.description())
                  .build();
            })
        .toList();
  }

  /**
   * What a remote section is called until the remote answers: the shell's label when it declares
   * one, else the last segment of its path (the field name), as Mateu has always shown it.
   */
  static String remoteLabel(RemoteMenu remote, String path) {
    if (hasText(remote.label())) {
      return remote.label();
    }
    var source = hasText(remote.path()) ? remote.path() : path;
    if (!hasText(source)) {
      return null;
    }
    var segment = source.substring(source.lastIndexOf('/') + 1);
    return segment.isEmpty() ? null : TranslatorContext.translate(toUpperCaseFirst(segment));
  }

  /**
   * Where a remote section's screens live, as far as the shell can tell before the remote answers:
   * its own mount path — NOT the path of the groups it sits in, because a remote declares its
   * routes from its own root ({@code /forms/tasks} for a {@code forms} remote grouped under {@code
   * /admin}). It is a convention, not a promise: the server confirms a deep link against the
   * remote's menu (RemoteMenuHandler), and the renderer only uses it for the active section and the
   * first breadcrumb while the remote has not answered.
   */
  static String remoteRoutePrefix(RemoteMenu remote, String path) {
    var own = hasText(remote.path()) ? remote.path() : path;
    if (!hasText(own) || "/".equals(own.trim())) {
      return null;
    }
    return prepend("", own.trim());
  }

  private static boolean hasText(String text) {
    return text != null && !text.isBlank();
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
