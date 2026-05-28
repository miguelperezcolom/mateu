package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getButtons;
import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getToolbar;
import static io.mateu.core.domain.out.componentmapper.PageContentBuilder.getContent;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.*;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

public class ReflectionPageMapper {

  public static PageView mapToPageComponent(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return PageView.builder()
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

  public static String getTitle(Object instance) {
    return PageMetadataExtractor.getTitle(instance);
  }

  public static Collection<? extends Component> getContent(
      Object instanceOrType,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return PageContentBuilder.getContent(
        instanceOrType, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  private static List<Breadcrumb> getBreadcrumbs(Object instance, HttpRequest httpRequest) {
    if (instance == null) return null;
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
}
