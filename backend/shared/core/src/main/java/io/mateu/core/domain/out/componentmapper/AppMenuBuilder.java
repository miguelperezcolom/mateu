package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.Authorizer.isAuthorized;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
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
                            && isAuthorized(
                                MetaAnnotations.find(field, EyesOnly.class), httpRequest))
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
    return MenuEntryMapper.mapToMenu(appRoute, method, instance, route, httpRequest);
  }

  private static Actionable mapToMenu(
      String appRoute, Field field, Object instance, String route, HttpRequest httpRequest) {
    return MenuEntryMapper.mapToMenu(appRoute, field, instance, route, httpRequest);
  }

  static List<Actionable> completeActionables(String appRoute, List<Actionable> menu) {
    return MenuEntryMapper.completeActionables(appRoute, menu);
  }
}
