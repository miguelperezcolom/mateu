package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.Humanizer.capitalize;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.CssClasses;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.PageTitle;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.AvatarSupplier;
import io.mateu.uidl.interfaces.ButtonsSupplier;
import io.mateu.uidl.interfaces.ContentSupplier;
import io.mateu.uidl.interfaces.FooterSupplier;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;
import java.util.stream.Stream;
import jdk.jfr.Label;

public class ReflectionPageMapper {

  public static Page mapToPageComponent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return Page.builder()
        .pageTitle(getPageTitle(instance))
        .title(getTitle(instance))
        .favicon(getFavicon(instance))
        .subtitle(getSubtitle(instance))
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .avatar(getAvatar(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toolbar(getToolbar(instance))
        .buttons(getButtons(instance))
        .header(getHeader(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .content(getContent(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .footer(getFooter(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }

  private static Collection<? extends Component> getFooter(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof FooterSupplier footerSupplier) {
      return footerSupplier.footer();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Footer.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static Collection<? extends Component> getContent(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof ContentSupplier contentSupplier) {
      return contentSupplier.content();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                    && !field.isAnnotationPresent(Toolbar.class)
                    && !field.isAnnotationPresent(Header.class)
                    && !field.isAnnotationPresent(Footer.class)
                    && !field.isAnnotationPresent(Avatar.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static Collection<? extends Component> getHeader(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof HeaderSupplier headerSupplier) {
      return headerSupplier.header();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Header.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  private static Collection<? extends UserTrigger> getButtons(Object instance) {
    if (instance instanceof ButtonsSupplier buttonsSupplier) {
      return buttonsSupplier.buttons();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .map(field -> getButton(field, instance)),
            getAllMethods(instance.getClass()).stream()
                .filter(
                    method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Button.class))
                .map(method -> getButton(method, instance)))
        .toList();
  }

  private static Collection<? extends UserTrigger> getToolbar(Object instance) {
    if (instance instanceof ToolbarSupplier toolbarSupplier) {
      return toolbarSupplier.toolbar();
    }
    return Stream.concat(
            getAllFields(instance.getClass()).stream()
                .filter(field -> field.isAnnotationPresent(Toolbar.class))
                .map(field -> getButton(field, instance)),
            getAllMethods(instance.getClass()).stream()
                .filter(method -> method.isAnnotationPresent(Toolbar.class))
                .map(method -> getButton(method, instance)))
        .toList();
  }

  private static Button getButton(Method method, Object instance) {
    return Button.builder().label(getLabel(method)).build();
  }

  private static Button getButton(Field field, Object instance) {
    return Button.builder().label(getLabel(field)).build();
  }

  private static Component getAvatar(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof AvatarSupplier avatarSupplier) {
      return avatarSupplier.avatar();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Avatar.class))
        .findAny()
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .orElse(null);
  }

  private static String getFavicon(Object instance) {
    if (instance.getClass().isAnnotationPresent(FavIcon.class)) {
      return instance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
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

  private static String getLabel(Method method) {
    if (method.isAnnotationPresent(Label.class)) {
      return method.getAnnotation(Label.class).value();
    }
    return capitalize(method.getName());
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
