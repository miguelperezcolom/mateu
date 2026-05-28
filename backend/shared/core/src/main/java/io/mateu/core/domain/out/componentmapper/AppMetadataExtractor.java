package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.Humanizer;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.WidgetSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.Objects;
import jdk.jfr.Label;
import lombok.SneakyThrows;

class AppMetadataExtractor {

  static AppVariant getVariant(Object instance, Collection<? extends Actionable> menu) {
    if (instance != null
        && instance.getClass().isAnnotationPresent(io.mateu.uidl.annotations.App.class)) {
      var appVariant =
          instance.getClass().getAnnotation(io.mateu.uidl.annotations.App.class).value();
      if (appVariant != AppVariant.AUTO) {
        return appVariant;
      }
    }
    for (Actionable actionable : menu) {
      if (actionable instanceof Menu) {
        return AppVariant.MENU_ON_TOP;
      }
    }
    return AppVariant.TABS;
  }

  static String getLogo(Object instance) {
    if (instance.getClass().isAnnotationPresent(Logo.class)) {
      return instance.getClass().getAnnotation(Logo.class).value();
    }
    return null;
  }

  static String getFavicon(Object instance) {
    if (instance.getClass().isAnnotationPresent(FavIcon.class)) {
      return instance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  static boolean isDrawerClosed(Object instance) {
    return instance.getClass().isAnnotationPresent(DrawerClosed.class);
  }

  static String getCssClasses(Object instance) {
    if (instance.getClass().isAnnotationPresent(CssClasses.class)) {
      return instance.getClass().getAnnotation(CssClasses.class).value();
    }
    return null;
  }

  static String getStyle(Object instance) {
    if (instance.getClass().isAnnotationPresent(Style.class)) {
      return instance.getClass().getAnnotation(Style.class).value();
    }
    return null;
  }

  static Collection<? extends Component> getWidgets(
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

  static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return titleSupplier.title();
    }
    if (instance.getClass().isAnnotationPresent(Title.class)) {
      return instance.getClass().getAnnotation(Title.class).value();
    }
    return null;
  }

  static String getSubtitle(Object instance) {
    if (instance instanceof SubtitleSupplier subtitleSupplier) {
      return subtitleSupplier.subtitle();
    }
    if (instance.getClass().isAnnotationPresent(Subtitle.class)) {
      return instance.getClass().getAnnotation(Subtitle.class).value();
    }
    return null;
  }

  static String getPageTitle(Object instance) {
    if (instance instanceof PageTitleSupplier pageTitleSupplier) {
      return pageTitleSupplier.pageTitle();
    }
    if (instance.getClass().isAnnotationPresent(PageTitle.class)) {
      return instance.getClass().getAnnotation(PageTitle.class).value();
    }
    if (instance.getClass().isAnnotationPresent(UI.class)
        || instance.getClass().isAnnotationPresent(Route.class)) {
      return toUpperCaseFirst(instance.getClass().getSimpleName());
    }
    return null;
  }

  static String getLabel(Method method) {
    if (method.isAnnotationPresent(Label.class)) {
      return method.getAnnotation(Label.class).value();
    }
    return Humanizer.toUpperCaseFirst(method.getName());
  }

  static String getLabel(Field field) {
    if (field.isAnnotationPresent(Label.class)) {
      return field.getAnnotation(Label.class).value();
    }
    return Humanizer.toUpperCaseFirst(field.getName());
  }
}
