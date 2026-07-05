package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.AppData;
import io.mateu.uidl.data.AppState;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.Page;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.net.URL;

public final class ViewTypeClassifier {

  public static boolean isApp(Class<?> instanceType, String route) {
    if (route.endsWith("_page") || route.endsWith("_no_home_route")) {
      return false;
    }
    if (instanceType.isAnnotationPresent(HomeRoute.class)) return true;
    if (AppSupplier.class.isAssignableFrom(instanceType)) return true;
    if (App.class.isAssignableFrom(instanceType)) return true;
    if (getAllFields(instanceType).stream()
        .anyMatch(field -> MetaAnnotations.isPresent(field, Menu.class))) return true;
    return false;
  }

  public static boolean isPage(Object instance, String route) {
    if (instance instanceof Data) return false;
    if (instance instanceof Message) return false;
    if (instance instanceof State) return false;
    if (instance instanceof AppData) return false;
    if (instance instanceof AppState) return false;
    // action-result payloads (same exclusions as FragmentListMapper) — never pages;
    // UICommand is a record, so without this it fell through to isRecord() and its
    // toString() ended up as the window title
    if (instance instanceof UICommand) return false;
    if (instance instanceof PageBanner) return false;
    if (instance instanceof PageBanners) return false;
    if (instance instanceof URI) return false;
    if (instance instanceof URL) return false;
    if (route != null && (route.endsWith("_page") || route.endsWith("_no_home_route"))) {
      return true;
    }
    if (instance instanceof ComponentTreeSupplier
        || instance instanceof Component
        || instance instanceof ComponentDto) {
      return false;
    }
    return instance instanceof Page
        || instance instanceof ListingBackend<?, ?>
        || instance.getClass().isAnnotationPresent(UI.class)
        || instance.getClass().isAnnotationPresent(Route.class)
        || instance.getClass().isRecord()
        || (!isBasic(instance)
            && (hasSomething(instance) || getAllFields(instance.getClass()).isEmpty()));
  }

  private static boolean hasSomething(Object instance) {
    for (Method method : getAllMethods(instance.getClass())) {
      if (MetaAnnotations.isPresent(method, Toolbar.class)) return true;
      if (MetaAnnotations.isPresent(method, Button.class)) return true;
    }
    for (Field field : getAllFields(instance.getClass())) {
      if (MetaAnnotations.isPresent(field, Toolbar.class)) return true;
      if (MetaAnnotations.isPresent(field, Button.class)) return true;
      if (MetaAnnotations.isPresent(field, KPI.class)) return true;
      if (!Modifier.isFinal(field.getModifiers())) return true;
    }
    return false;
  }
}
