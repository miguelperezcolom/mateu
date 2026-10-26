package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getButtons;
import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getFabs;
import static io.mateu.core.domain.out.componentmapper.PageButtonsBuilder.getToolbar;
import static io.mateu.core.domain.out.componentmapper.PageContentBuilder.getContent;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.*;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.getBadges;
import static io.mateu.core.domain.out.componentmapper.PageMetadataExtractor.getBanners;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Breadcrumb;
import io.mateu.uidl.data.HeroSection;
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
    var content = new java.util.ArrayList<Component>();
    var welcomeBanner = MetaAnnotations.find(instance.getClass(), WelcomeBanner.class);
    if (welcomeBanner != null) {
      content.add(
          HeroSection.builder()
              .id("welcome-banner")
              .title(welcomeBanner.title().isBlank() ? getTitle(instance) : welcomeBanner.title())
              .subtitle(welcomeBanner.subtitle().isBlank() ? null : welcomeBanner.subtitle())
              .image(welcomeBanner.image().isBlank() ? null : welcomeBanner.image())
              .tone(welcomeBanner.tone())
              .overline(welcomeBanner.overline().isBlank() ? null : welcomeBanner.overline())
              .centered(true)
              .build());
    }
    content.addAll(
        getContent(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    return PageView.builder()
        .pageTitle(getPageTitle(instance))
        .breadcrumbs(getBreadcrumbs(instance, httpRequest))
        .noBreadcrumbs(
            MetaAnnotations.isPresent(
                    instance.getClass(), io.mateu.uidl.annotations.NoBreadcrumbs.class)
                ? Boolean.TRUE
                : null)
        .title(getTitle(instance, httpRequest))
        .favicon(getFavicon(instance))
        .subtitle(getSubtitle(instance))
        .overline(getOverline(instance))
        .titlePlaceholder(getTitlePlaceholder(instance))
        .style(getStyle(instance))
        .cssClasses(getCssClasses(instance))
        .toc(getToc(instance))
        .peerNav(getPeerNav(instance, httpRequest))
        .switcher(getSwitcher(instance, httpRequest))
        .timestamp(getTimestamp(instance))
        .pageWidth(getPageWidth(instance))
        .pageType(PageTypeResolver.resolve(instance))
        .avatar(getAvatar(instance, baseUrl, route, initiatorComponentId, httpRequest))
        // un LISTADO enrutado muestra su toolbar en el HEADER de la página (título y
        // acciones en una línea); el crud del renderer compartido suprime su copia
        .toolbar(
            instance instanceof io.mateu.uidl.interfaces.Listing<?>
                    || instance instanceof io.mateu.uidl.interfaces.ReactiveListing<?>
                ? java.util.stream.Stream.concat(
                        getToolbar(instance, httpRequest).stream(),
                        PageListingBuilder.getToolbarButtons(instance, httpRequest).stream())
                    .map(trigger -> (io.mateu.uidl.fluent.UserTrigger) trigger)
                    .toList()
                : io.mateu.core.domain.CrudNavigation.withToolbar(
                    instance, httpRequest, getToolbar(instance, httpRequest)))
        .buttons(
            io.mateu.core.domain.CrudNavigation.withButtons(
                instance, httpRequest, getButtons(instance, httpRequest)))
        .fabs(getFabs(instance, httpRequest))
        .kpis(getKpis(instance))
        .badges(getBadges(instance, httpRequest))
        .banners(getBanners(instance, httpRequest))
        .header(getHeader(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .content(content)
        .footer(getFooter(instance, baseUrl, route, initiatorComponentId, httpRequest))
        .build();
  }

  /** The {@code @Toolbar} buttons a view model declares (its fields and methods). */
  public static java.util.List<io.mateu.uidl.fluent.UserTrigger> toolbarOf(
      Object instance, HttpRequest httpRequest) {
    return new java.util.ArrayList<>(getToolbar(instance, httpRequest));
  }

  /** The {@code @Button} buttons a view model declares (its fields and methods). */
  public static java.util.List<io.mateu.uidl.fluent.UserTrigger> buttonsOf(
      Object instance, HttpRequest httpRequest) {
    return new java.util.ArrayList<>(getButtons(instance, httpRequest));
  }

  public static String getTitle(Object instance) {
    return PageMetadataExtractor.getTitle(instance);
  }

  /**
   * The title a view model DECLARES ({@code TitleSupplier}, else {@code @Title}), or null — unlike
   * {@link #getTitle(Object)}, never derived from the class name or the record's data.
   */
  public static String getDeclaredTitle(Object instance) {
    if (instance instanceof TitleSupplier
        || MetaAnnotations.isPresent(instance.getClass(), Title.class)) {
      return PageMetadataExtractor.getTitle(instance);
    }
    return null;
  }

  /**
   * The canonical page-header pieces a view model declares — subtitle, overline, timestamp, peer
   * navigation, record switcher, avatar, header badges, KPIs and banners — as a title-less {@link
   * PageView} with no content, or {@code null} when it declares none of them. The composed
   * archetypes (a {@code Dashboard}, a {@code DataManagement}…) build their own tree, so this is
   * how what a reflected page reads into its header reaches theirs. {@code withHeroChrome = false}
   * leaves out the subtitle and the overline: a page whose tree opens with a hero already shows
   * them there.
   */
  public static PageView headerOf(
      Object instance,
      boolean withHeroChrome,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var subtitle = withHeroChrome ? getSubtitle(instance) : null;
    var overline = withHeroChrome ? getOverline(instance) : null;
    var timestamp = getTimestamp(instance);
    var peerNav = getPeerNav(instance, httpRequest);
    var switcher = getSwitcher(instance, httpRequest);
    var avatar = getAvatar(instance, baseUrl, route, initiatorComponentId, httpRequest);
    var badges = getBadges(instance, httpRequest);
    var kpis = getKpis(instance);
    var banners = getBanners(instance, httpRequest);
    if (subtitle == null
        && overline == null
        && timestamp == null
        && peerNav == null
        && switcher == null
        && avatar == null
        && (badges == null || badges.isEmpty())
        && (kpis == null || kpis.isEmpty())
        && (banners == null || banners.isEmpty())) {
      return null;
    }
    return PageView.builder()
        .subtitle(subtitle)
        .overline(overline)
        .timestamp(timestamp)
        .peerNav(peerNav)
        .switcher(switcher)
        .avatar(avatar)
        .badges(badges != null ? badges : List.of())
        .kpis(kpis != null ? kpis : List.of())
        .banners(banners != null ? banners : List.of())
        .build();
  }

  /**
   * The page title of {@code instance}, remembered for this request as a DATA title (rendered as
   * text — {@code PageDto.titleIsText}) when it is the record's own {@code toString()}.
   */
  public static String getTitle(Object instance, HttpRequest httpRequest) {
    var title = PageMetadataExtractor.getTitle(instance);
    return PageMetadataExtractor.titledByData(instance)
        ? DataTitles.mark(httpRequest, title)
        : title;
  }

  /** The page subtitle of a view model ({@code SubtitleSupplier} or {@code @Subtitle}), or null. */
  public static String getPageSubtitle(Object instance) {
    return PageMetadataExtractor.getSubtitle(instance);
  }

  /** Page-header badges (from {@code @BadgeInHeader} fields / {@code HeaderBadgesSupplier}). */
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
