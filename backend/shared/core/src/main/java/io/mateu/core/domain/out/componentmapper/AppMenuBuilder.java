package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.Authorizer.isAuthorized;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.domain.AudienceGate;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Audience;
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
    var declared = declaredActionables(appRoute, instance, route, httpRequest);
    if (declared.isEmpty()) {
      return childRouteTabs(appRoute, instance, httpRequest);
    }
    return declared;
  }

  /**
   * An app that declares no menu of its own but answers a registry route with {@code children}
   * offers those children as its options — the tabs of a record master, each one a page with its
   * own URL. The label is the child's {@code @Title}, else its route segment humanized.
   */
  static List<Actionable> childRouteTabs(
      String appRoute, Object instance, HttpRequest httpRequest) {
    return io.mateu.core.application.runaction.RouteChains.visibleChildrenOf(appRoute, httpRequest)
        .stream()
        .map(
            child ->
                (Actionable)
                    new io.mateu.uidl.data.RouteLink(child.path(), labelOf(child))
                        .withPath(child.relative())
                        .withServerSideType(instance.getClass().getName())
                        .withConsumedRoute(appRoute))
        .toList();
  }

  private static String labelOf(io.mateu.core.application.runaction.RouteChains.ChildRoute child) {
    return io.mateu.core.application.runaction.RouteChains.tabLabel(
        child.entry(), child.relative());
  }

  private static List<Actionable> declaredActionables(
      String appRoute, Object instance, String route, HttpRequest httpRequest) {
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(
                    field ->
                        MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Menu.class)
                            && isAuthorized(
                                MetaAnnotations.find(field, EyesOnly.class), httpRequest)
                            && AudienceGate.visible(
                                MetaAnnotations.find(field, Audience.class), httpRequest))
                .map(field -> mapToMenu(appRoute, field, instance, route, httpRequest))
                .filter(Objects::nonNull),
            getAllMethods(instance.getClass()).stream()
                .filter(
                    method ->
                        MetaAnnotations.isPresent(method, io.mateu.uidl.annotations.Menu.class)
                            && isAuthorized(
                                MetaAnnotations.find(method, EyesOnly.class), httpRequest)
                            && AudienceGate.visible(
                                MetaAnnotations.find(method, Audience.class), httpRequest))
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
