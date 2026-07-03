package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getButtons;
import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getFabs;
import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getToolbar;
import static io.mateu.core.domain.out.componentmapper.PageContentBuilder.getContent;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.getBadges;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.getBanners;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.*;
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
        .toc(getToc(instance))
        .avatar(getAvatar(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .toolbar(getToolbar(instance, httpRequest))
        .buttons(getButtons(instance, httpRequest))
        .fabs(getFabs(instance, httpRequest))
        .kpis(getKpis(instance))
        .badges(getBadges(instance, httpRequest))
        .banners(getBanners(instance, httpRequest))
        .header(getHeader(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .content(
            getContent(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest))
        .footer(getFooter(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }

  public static String getTitle(Object instance) {
    return PageMetadataExtractor.getTitle(instance);
  }

  /** Page-header badges (from {@code @BadgeInHeader} fields / {@code BadgeSupplier}). */
  public static List<io.mateu.uidl.data.Badge> getPageBadges(
      Object instance, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    return getBadges(instance, httpRequest);
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
    return PageSectionExtractor.getBreadcrumbs(instance, httpRequest);
  }

  private static Collection<? extends Component> getHeader(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return PageSectionExtractor.getHeader(
        instance, baseUrl, route, initiatorComponentId, httpRequest);
  }

  private static Collection<? extends Component> getFooter(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return PageSectionExtractor.getFooter(
        instance, baseUrl, route, initiatorComponentId, httpRequest);
  }

  private static Component getAvatar(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return PageSectionExtractor.getAvatar(
        instance, baseUrl, route, initiatorComponentId, httpRequest);
  }
}
