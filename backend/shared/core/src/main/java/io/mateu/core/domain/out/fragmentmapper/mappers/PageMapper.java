package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.core.domain.out.componentmapper.PageWidthResolver;
import io.mateu.dtos.BannerDto;
import io.mateu.dtos.BannerThemeDto;
import io.mateu.dtos.BreadcrumbDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FabDto;
import io.mateu.dtos.PageDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class PageMapper {

  private static BannerDto mapToBannerDto(PageBanner banner) {
    BannerThemeDto theme = BannerThemeDto.NONE;
    if (banner.theme() != null) {
      try {
        theme = BannerThemeDto.valueOf(banner.theme().name());
      } catch (IllegalArgumentException ignored) {
      }
    }
    return new BannerDto(
        theme,
        false,
        banner.closeable(),
        banner.title(),
        banner.description(),
        banner.timeoutSeconds());
  }

  private static FabDto mapToFabDto(UserTrigger trigger) {
    if (trigger instanceof Button b) {
      return FabDto.builder()
          .id(b.actionId())
          .label(b.label())
          .icon(b.iconOnLeft())
          .actionId(b.actionId())
          .buttonStyle(b.buttonStyle() != null ? b.buttonStyle().name() : "primary")
          .build();
    }
    return null;
  }

  public static ComponentDto mapPageToDto(
      PageView page,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var formMetadataDto =
        PageDto.builder()
            .pageTitle(page.pageTitle())
            .level(page.level())
            .favicon(page.favicon())
            .title(page.title())
            .subtitle(page.subtitle())
            .breadcrumbs(
                page.breadcrumbs() != null
                    ? page.breadcrumbs().stream()
                        .map(breadcrumb -> new BreadcrumbDto(breadcrumb.text(), breadcrumb.link()))
                        .toList()
                    : null)
            .avatar(
                page.avatar() != null
                    ? mapComponentToDto(
                            null,
                            page.avatar(),
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest)
                        .addStyle("width: 4rem;height: 4rem;")
                    : null)
            .badges(
                page.badges() != null
                    ? page.badges().stream().map(BadgeMapper::mapBadgeToBadgeDto).toList()
                    : null)
            .kpis(
                page.kpis() != null
                    ? page.kpis().stream().map(KPIMapper::mapKPIToKPIDto).toList()
                    : null)
            .header(
                page.header() != null
                    ? page.header().stream()
                        .map(
                            component ->
                                mapComponentToDto(
                                    null,
                                    component,
                                    baseUrl,
                                    route,
                                    consumedRoute,
                                    initiatorComponentId,
                                    httpRequest))
                        .toList()
                    : null)
            .footer(
                page.footer() != null
                    ? page.footer().stream()
                        .map(
                            component ->
                                mapComponentToDto(
                                    null,
                                    component,
                                    baseUrl,
                                    route,
                                    consumedRoute,
                                    initiatorComponentId,
                                    httpRequest))
                        .toList()
                    : null)
            .toolbar(
                page.toolbar() != null
                    ? page.toolbar().stream().map(FormMapper::mapToButtonDto).toList()
                    : null)
            .buttons(
                page.buttons() != null
                    ? page.buttons().stream().map(FormMapper::mapToButtonDto).toList()
                    : null)
            .fabs(
                page.fabs() != null
                    ? page.fabs().stream().map(PageMapper::mapToFabDto).toList()
                    : null)
            .banners(
                page.banners() != null
                    ? page.banners().stream().map(PageMapper::mapToBannerDto).toList()
                    : null)
            .toc(page.toc())
            .pageWidth(PageWidthResolver.toWireName(page.pageWidth()))
            .build();
    return new ClientSideComponentDto(
        formMetadataDto,
        page.id(),
        page.content().stream()
            .map(
                component ->
                    mapComponentToDto(
                        null,
                        component,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest))
            .toList(),
        page.style(),
        page.cssClasses(),
        null);
  }
}
