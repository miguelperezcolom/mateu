package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.Authorizer.isAuthorized;
import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.componentmapper.AppMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;
import static io.mateu.uidl.Humanizer.toCamelCase;
import static io.mateu.uidl.Humanizer.toKebabCase;

import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.Submenu;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

class AppMenuBuilder {

  static Collection<? extends Actionable> getMenu(
      String appRoute, Object instance, String route, HttpRequest httpRequest) {
    if (instance instanceof MenuSupplier menuSupplier) {
      return menuSupplier.menu(httpRequest);
    }
    return getActionables(appRoute, instance, route, httpRequest);
  }

  static List<Actionable> getActionables(
      String appRoute, Object instance, String route, HttpRequest httpRequest) {
    if (instance instanceof AppSupplier appSupplier) {
      return appSupplier.getApp(httpRequest).menu();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(
                    field ->
                        field.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class)
                            && isAuthorized(field.getAnnotation(EyesOnly.class), httpRequest))
                .map(field -> mapToMenu(appRoute, field, instance, route, httpRequest))
                .filter(Objects::nonNull),
            getAllMethods(instance.getClass()).stream()
                .filter(
                    method ->
                        method.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class)
                            && isAuthorized(method.getAnnotation(EyesOnly.class), httpRequest))
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
    var menuAnnotation = field.getAnnotation(io.mateu.uidl.annotations.Menu.class);
    var description =
        (menuAnnotation != null && !menuAnnotation.description().isBlank())
            ? menuAnnotation.description()
            : null;
    if (Actionable.class.isAssignableFrom(field.getType())) {
      return completeActionable(appRoute, field, instance);
    }
    if (String.class.equals(field.getType())) {
      var uri = (String) getValue(field, instance);
      if (uri != null) {
        return new RouteLink(uri, getLabel(field))
            .withPath("/" + field.getName())
            .withServerSideType(instance.getClass().getName())
            .withConsumedRoute(appRoute)
            .withDescription(description);
      }
      return new RouteLink(appRoute + "/" + toKebabCase(field.getName()), getLabel(field))
          .withPath("/" + field.getName())
          .withServerSideType(instance.getClass().getName())
          .withConsumedRoute(appRoute)
          .withDescription(description);
    }
    if (URI.class.equals(field.getType())) {
      var uri = (URI) getValue(field, instance);
      if (uri != null) {
        return new RouteLink(uri.toString(), getLabel(field))
            .withPath("/" + field.getName())
            .withDescription(description);
      }
      return new RouteLink(appRoute + "/" + toKebabCase(field.getName()), getLabel(field))
          .withPath("/" + field.getName())
          .withDescription(description);
    }
    if (Submenu.class.isAssignableFrom(field.getType())) {
      return new Menu(
              "/" + field.getName(),
              getLabel(field),
              getActionables(
                  appRoute,
                  getValueOrNewInstance(field, instance, httpRequest),
                  route,
                  httpRequest))
          .withDescription(description);
    }
    if (MenuSupplier.class.isAssignableFrom(field.getType())) {
      var menuSupplier = (MenuSupplier) getValue(field, instance);
      return new Menu(
              "/" + field.getName(),
              getLabel(field),
              completeActionables(appRoute, menuSupplier.menu(httpRequest)))
          .withDescription(description);
    }
    if (!isBasic(field.getType())) {
      if (getAllFields(field.getType()).stream()
          .anyMatch(
              childField ->
                  childField.isAnnotationPresent(io.mateu.uidl.annotations.Menu.class)
                      && isAuthorized(childField.getAnnotation(EyesOnly.class), httpRequest))) {
        return new Menu(
                "/" + field.getName(),
                getLabel(field),
                getActionables(
                    appRoute,
                    getValueOrNewInstance(field, instance, httpRequest),
                    route,
                    httpRequest))
            .withDescription(description);
      }
    }
    return new FieldLink(
            "/" + field.getName(), getLabel(field), instance.getClass(), field.getName())
        .withDescription(description);
  }

  static List<Actionable> completeActionables(String appRoute, List<Actionable> menu) {
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
      if (actionable instanceof RouteLink routeLink) {
        actionable = routeLink.withPath("/" + field.getName());
      }
      if (actionable instanceof ContentLink contentLink) {
        actionable = contentLink.withPath("/" + field.getName());
      }
      if (actionable instanceof FieldLink fieldLink) {
        actionable = fieldLink.withPath("/" + field.getName());
      }
      if (actionable instanceof MethodLink methodLink) {
        actionable = methodLink.withPath("/" + field.getName());
      }
      if (actionable instanceof RemoteMenu remoteMenu) {
        actionable = remoteMenu.withPath("/" + field.getName());
      }
    }
    return actionable;
  }
}
