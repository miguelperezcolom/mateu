package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.Humanizer.capitalize;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.fragmentmapper.reflectionbased.ReflectionCommonMapper.getTitle;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.DrawerClosed;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Widget;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.WidgetSupplier;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import jdk.jfr.Label;
import lombok.SneakyThrows;

public class ReflectionAppMapper {

  public static App mapToAppComponent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return App.builder()
        .pageTitle(getPageTitle(instance))
        .title(getTitle(instance))
        .subtitle(getSubtitle(instance))
        .menu(getMenu(instance, httpRequest))
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .drawerClosed(isDrawerClosed(instance))
        .widgets(getWidgets(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
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
    return mapToComponent(field.get(instance), baseUrl, route, initiatorComponentId, httpRequest);
  }

  private static Collection<? extends Actionable> getMenu(
      Object instance, HttpRequest httpRequest) {
    if (instance instanceof MenuSupplier menuSupplier) {
      return menuSupplier.menu(httpRequest);
    }
    return getActionables(instance.getClass());
  }

  private static List<Actionable> getActionables(Class<?> type) {
    return getAllFields(type).stream()
        .filter(field -> field.isAnnotationPresent(MenuOption.class))
        .map(field -> mapToMenu(field, type))
        .filter(Objects::nonNull)
        .toList();
  }

  private static Actionable mapToMenu(Field field, Class<?> type) {
    if (String.class.equals(field.getType())) {
      return new RouteLink("/fluent-app/home", getLabel(field));
    }
    if (!isBasic(field.getType())) {
      return new Menu(getLabel(field), getActionables(field.getType()));
    }
    return null;
  }

  private static String getLabel(Field field) {
    if (field.isAnnotationPresent(Label.class)) {
      return field.getAnnotation(Label.class).value();
    }
    return capitalize(field.getName());
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
      return capitalize(instance.getClass().getSimpleName());
    }
    return null;
  }
}
