package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Breadcrumbs;
import io.mateu.uidl.annotations.Footer;
import io.mateu.uidl.annotations.Header;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.AvatarSupplier;
import io.mateu.uidl.interfaces.BreadcrumbsSupplier;
import io.mateu.uidl.interfaces.FooterSupplier;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

final class PageSectionExtractor {

  static List<Breadcrumb> getBreadcrumbs(Object instance, HttpRequest httpRequest) {
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

  static Collection<? extends Component> getHeader(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof HeaderSupplier headerSupplier) {
      return headerSupplier.header();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Header.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  static Collection<? extends Component> getFooter(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof FooterSupplier footerSupplier) {
      return footerSupplier.footer();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Footer.class))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  static Component getAvatar(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (instance instanceof AvatarSupplier avatarSupplier) {
      return avatarSupplier.avatar();
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, Avatar.class))
        .findAny()
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .orElse(null);
  }

  private PageSectionExtractor() {}
}
