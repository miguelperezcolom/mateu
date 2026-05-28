package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getCrud;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;
import lombok.SneakyThrows;

public class ReflectionPageMapper {

  public static Page mapToPageComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return Page.builder()
        .pageTitle(getPageTitle(instance))
        .breadcrumbs(getBreadcrumbs(instance, httpRequest))
        .title(getTitle(instance))
        .favicon(getFavicon(instance))
        .subtitle(getSubtitle(instance))
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .avatar(getAvatar(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toolbar(getToolbar(instance))
        .buttons(getButtons(instance))
        .header(getHeader(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .content(
            getContent(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest))
        .footer(getFooter(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }

  private static List<Breadcrumb> getBreadcrumbs(Object instance, HttpRequest httpRequest) {
    if (instance == null) {
      return null;
    }
    if (instance instanceof BreadcrumbsSupplier breadcrumbsSupplier) {
      return breadcrumbsSupplier.breadcrumbs(httpRequest);
    }
    if (instance.getClass().isAnnotationPresent(Breadcrumbs.class)) {
      return Arrays.stream(instance.getClass().getAnnotation(Breadcrumbs.class).value())
          .map(breadcrumb -> new Breadcrumb(breadcrumb.label(), breadcrumb.url()))
          .toList();
    }
    return null;
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

  @SneakyThrows
  public static Collection<? extends Component> getContent(
      Object instanceOrType,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    Object instance;
    if (instanceOrType instanceof Class<?> type) {
      instance = MateuBeanProvider.getBean(InstanceFactory.class).newInstance(type, httpRequest);
    } else {
      instance = instanceOrType;
    }
    if (instance instanceof ContentSupplier contentSupplier) {
      return contentSupplier.content();
    }
    if (instance instanceof ListingBackend<?, ?>
        || instance instanceof ReactiveListingBackend<?, ?>) {
      return getCrud(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (isApp(instance.getClass(), route)) {
      return List.of(
          mapToAppComponent(
              instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    }
    if (isForm(instance)) {
      return getForm(
          instance,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest,
          false,
          false,
          getFormColumns(instance.getClass()));
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> !Modifier.isFinal(field.getModifiers()))
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                    && !field.isAnnotationPresent(Toolbar.class)
                    && !field.isAnnotationPresent(Header.class)
                    && !field.isAnnotationPresent(Footer.class)
                    && !field.isAnnotationPresent(Avatar.class)
                    && !field.isAnnotationPresent(Menu.class)
                    && !Status.class.equals(field.getType()))
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
    return Button.builder().label(getLabel(method)).actionId(method.getName()).build();
  }

  private static Button getButton(Field field, Object instance) {
    return Button.builder().label(getLabel(field)).actionId(field.getName()).build();
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
    return toUpperCaseFirst(method.getName());
  }

  private static String getLabel(Field field) {
    return FieldMetadataExtractor.getLabel(field);
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

  @SneakyThrows
  public static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return titleSupplier.title();
    }
    if (instance.getClass().isAnnotationPresent(Title.class)) {
      return instance.getClass().getAnnotation(Title.class).value();
    }
    if (instance instanceof NamedView namedView) {
      return namedView.name();
    }
    if (instance instanceof Named named) {
      return named.name();
    }
    if (instance != null) {
      if (instance.getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
        return getPageTitle(instance);
      }
      return instance.toString();
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
    if (instance.getClass().isAnnotationPresent(UI.class)
        || instance.getClass().isAnnotationPresent(Route.class)) {
      return toUpperCaseFirst(instance.getClass().getSimpleName());
    }
    return toUpperCaseFirst(instance.getClass().getSimpleName());
  }
}
