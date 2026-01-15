package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionAppMapper.getRoute;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.Humanizer;
import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.DrawerClosed;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Widget;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.Submenu;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.WidgetSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import jdk.jfr.Label;
import lombok.SneakyThrows;

public class ReflectionAppMapper {

  public static App mapToAppComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var appRoute = getRoute(instance, instance, httpRequest, route, consumedRoute);
    var menu = getMenu(appRoute, instance, route, httpRequest);
    var selectedOption = getSelectedOption(appRoute, route, menu);
    return App.builder()
        .route(appRoute)
        .homeRoute(getHomeRoute(instance, selectedOption))
        .homeBaseUrl(getHomeBaseUrl(baseUrl, selectedOption))
        .homeAppServerSideType(getHomeAppServerSideType(instance, selectedOption))
        .homeConsumedRoute(getHomeConsumedRoute(appRoute, selectedOption))
        .homeUriPrefix(getHomeUriPrefix(selectedOption))
        .serverSideType(instance.getClass().getName())
        .variant(getVariant(instance, menu))
        .pageTitle(getPageTitle(instance))
        .title(getTitle(instance))
        .favicon(getFavicon(instance))
        .logo(getLogo(instance))
        .subtitle(getSubtitle(instance))
        .menu(menu)
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .drawerClosed(isDrawerClosed(instance))
        .widgets(getWidgets(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }

  public static Optional<Actionable> getSelectedOption(
      String appRoute, String route, Collection<? extends Actionable> menu) {
    if (!appRoute.equals(route)) {
      var effectiveRoute = route.substring(appRoute.length()); // /masterData/countries
      return getSelectedOption(effectiveRoute, menu);
    }
    return Optional.empty();
  }

  public static Optional<Actionable> getSelectedOption(
      String route, Collection<? extends Actionable> actionables) {
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var token = route.split("/")[0];
    if (!"".equals(token)) {
      token = "/" + token;
      for (Actionable actionable : actionables) {
        if (token.equals(actionable.path())) {
          if (actionable instanceof Menu menu) {
            return getSelectedOption(
                Arrays.stream(route.split("/")).skip(1).collect(Collectors.joining("/")),
                menu.submenu());
          }
          if (actionable instanceof RemoteMenu remoteMenu) {
            return Optional.of(remoteMenu);
          }
        }
      }
    }
    return Optional.empty();
  }

  private static String getHomeUriPrefix(Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.path();
    }
    return null;
  }

  private static String getHomeConsumedRoute(
      String appRoute, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.consumedRoute();
    }
    return appRoute;
  }

  private static String getHomeAppServerSideType(
      Object instance, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.appServerSideType();
    }
    return null;
  }

  private static String getHomeBaseUrl(
      String baseUrl, Optional<? extends Actionable> selectedOption) {
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      return remoteMenu.baseUrl();
    }
    return null;
  }

  private static String getHomeRoute(Object instance, Optional<Actionable> selectedOption) {
    var prefix = "";
    if (selectedOption.isPresent() && selectedOption.get() instanceof RemoteMenu remoteMenu) {
      prefix = remoteMenu.path();
    }
    if (instance instanceof HomeRouteSupplier homeRouteSupplier) {
      return homeRouteSupplier.homeRoute().substring(prefix.length());
    }
    if (instance.getClass().isAnnotationPresent(HomeRoute.class)) {
      return instance.getClass().getAnnotation(HomeRoute.class).value().substring(prefix.length());
    }
    return "xxx";
  }

  private static AppVariant getVariant(Object instance, Collection<? extends Actionable> menu) {
    for (Actionable actionable : menu) {
      if (isMenu(actionable)) {
        return AppVariant.MENU_ON_TOP;
      }
    }
    return AppVariant.TABS;
  }

  private static boolean isMenu(Actionable actionable) {
    return actionable instanceof Menu;
  }

  private static String getLogo(Object instance) {
    if (instance.getClass().isAnnotationPresent(Logo.class)) {
      return instance.getClass().getAnnotation(Logo.class).value();
    }
    return null;
  }

  private static String getFavicon(Object instance) {
    if (instance.getClass().isAnnotationPresent(FavIcon.class)) {
      return instance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  private static boolean isDrawerClosed(Object instance) {
    return instance.getClass().isAnnotationPresent(DrawerClosed.class);
  }

  private static String getCssClasses(Object instance) {
    if (instance.getClass().isAnnotationPresent(CssClasses.class)) {
      return instance.getClass().getAnnotation(CssClasses.class).value();
    }
    return null;
  }

  private static String getStyle(Object instance) {
    if (instance.getClass().isAnnotationPresent(Style.class)) {
      return instance.getClass().getAnnotation(Style.class).value();
    }
    return null;
  }

  private static Collection<? extends Component> getWidgets(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof WidgetSupplier widgetSupplier) {
      return widgetSupplier.widgets(httpRequest);
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Widget.class))
        .map(
            field ->
                mapToWidget(field, instance, baseUrl, route, initiatorComponentId, httpRequest))
        .filter(Objects::nonNull)
        .toList();
  }

  @SneakyThrows
  private static Component mapToWidget(
      Field field,
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return mapToComponent(
        getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest);
  }

  private static Collection<? extends Actionable> getMenu(
      String appRoute, Object instance, String route, HttpRequest httpRequest) {
    if (instance instanceof MenuSupplier menuSupplier) {
      return menuSupplier.menu(httpRequest);
    }
    return getActionables(appRoute, instance, route, httpRequest);
  }

  private static List<Actionable> getActionables(
      String appRoute, Object instance, String route, HttpRequest httpRequest) {
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))
                .map(field -> mapToMenu(appRoute, field, instance, route, httpRequest))
                .filter(Objects::nonNull),
            getAllMethods(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))
                .map(method -> mapToMenu(appRoute, method, instance, route, httpRequest))
                .filter(Objects::nonNull))
        .toList();
  }

  private static Actionable mapToMenu(
      String appRoute, Method method, Object instance, String route, HttpRequest httpRequest) {
    if ("/".equals(appRoute)) {
      appRoute = "";
    }
    return new MethodLink(
        appRoute + "/" + method.getName(), getLabel(method), instance.getClass(), method.getName());
  }

  private static Actionable mapToMenu(
      String appRoute, Field field, Object instance, String route, HttpRequest httpRequest) {
    if ("/".equals(appRoute)) {
      appRoute = "";
    }
    if (Actionable.class.isAssignableFrom(field.getType())) {
      return completeActionable(appRoute, field, instance);
    }
    if (String.class.equals(field.getType())) {
      var uri = (String) getValue(field, instance);
      if (uri != null) {
        return new RouteLink(uri, getLabel(field));
      }
      return new RouteLink(appRoute + "/" + toKebabCase(field.getName()), getLabel(field));
    }
    if (URI.class.equals(field.getType())) {
      var uri = (URI) getValue(field, instance);
      if (uri != null) {
        return new RouteLink(uri.toString(), getLabel(field));
      }
      return new RouteLink(appRoute + "/" + toKebabCase(field.getName()), getLabel(field));
    }
    if (Submenu.class.isAssignableFrom(field.getType())) {
      return new Menu(
          getLabel(field),
          getActionables(appRoute, getValueOrNewInstance(field, instance), route, httpRequest));
    }
    if (MenuSupplier.class.isAssignableFrom(field.getType())) {
      var menuSupplier = (MenuSupplier) getValue(field, instance);
      return new Menu(
          getLabel(field), completeActionables(appRoute, menuSupplier.menu(httpRequest)));
    }
    if (!isBasic(field.getType())) {
      if (getAllFields(field.getType()).stream()
          .anyMatch(
              childField -> childField.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class))) {
        return new Menu(
            getLabel(field),
            getActionables(appRoute, getValueOrNewInstance(field, instance), route, httpRequest));
      }
    }
    return new FieldLink(
        appRoute + "/" + field.getName(), getLabel(field), instance.getClass(), field.getName());
  }

  private static List<Actionable> completeActionables(String appRoute, List<Actionable> menu) {
    if (menu == null) {
      return null;
    }
    return menu.stream()
        .map(
            actionable -> {
              if (actionable instanceof ContentLink contentLink) {
                if (contentLink.path() == null) {
                  return contentLink.withPath(appRoute + "/" + toCamelCase(contentLink.label()));
                }
              }
              return actionable;
            })
        .toList();
  }

  private static Actionable completeActionable(String appRoute, Field field, Object instance) {
    var actionable = (Actionable) getValue(field, instance);
    if (actionable.label() == null || actionable.label().isEmpty()) {
      if (actionable instanceof RouteLink routeLink) {
        actionable = routeLink.withLabel(getLabel(field));
      }
      if (actionable instanceof ContentLink contentLink) {
        actionable = contentLink.withLabel(getLabel(field));
      }
      if (actionable instanceof FieldLink fieldLink) {
        actionable = fieldLink.withLabel(getLabel(field));
      }
      if (actionable instanceof MethodLink methodLink) {
        actionable = methodLink.withLabel(getLabel(field));
      }
      if (actionable instanceof RemoteMenu remoteMenu) {
        actionable = remoteMenu.withLabel(getLabel(field));
      }
    }
    if (actionable.path() == null || actionable.path().isEmpty()) {
      if (actionable instanceof ContentLink contentLink) {
        actionable = contentLink.withPath(appRoute + "/" + field.getName());
      }
      if (actionable instanceof FieldLink fieldLink) {
        actionable = fieldLink.withPath(appRoute + "/" + field.getName());
      }
      if (actionable instanceof MethodLink methodLink) {
        actionable = methodLink.withPath(appRoute + "/" + field.getName());
      }
      if (actionable instanceof RemoteMenu remoteMenu) {
        actionable = remoteMenu.withPath(appRoute + "/" + field.getName());
      }
    }
    return actionable;
  }

  private static String getLabel(Method method) {
    if (method.isAnnotationPresent(Label.class)) {
      return method.getAnnotation(Label.class).value();
    }
    return Humanizer.toUpperCaseFirst(method.getName());
  }

  private static String getLabel(Field field) {
    if (field.isAnnotationPresent(Label.class)) {
      return field.getAnnotation(Label.class).value();
    }
    return Humanizer.toUpperCaseFirst(field.getName());
  }

  private static String getSubtitle(Object instance) {
    if (instance instanceof SubtitleSupplier subtitleSupplier) {
      return subtitleSupplier.subtitle();
    }
    if (instance.getClass().isAnnotationPresent(Subtitle.class)) {
      return instance.getClass().getAnnotation(Subtitle.class).value();
    }
    return null;
  }

  private static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return titleSupplier.title();
    }
    if (instance.getClass().isAnnotationPresent(Title.class)) {
      return instance.getClass().getAnnotation(Title.class).value();
    }
    return null;
  }

  private static String getPageTitle(Object instance) {
    if (instance instanceof PageTitleSupplier pageTitleSupplier) {
      return pageTitleSupplier.pageTitle();
    }
    if (instance.getClass().isAnnotationPresent(PageTitle.class)) {
      return instance.getClass().getAnnotation(PageTitle.class).value();
    }
    if (instance.getClass().isAnnotationPresent(MateuUI.class)
        || instance.getClass().isAnnotationPresent(Route.class)) {
      return Humanizer.toUpperCaseFirst(instance.getClass().getSimpleName());
    }
    return null;
  }
}
