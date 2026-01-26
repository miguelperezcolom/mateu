package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public class PageComponentToDtoMapper {

  public static ComponentDto mapPageToDto(
      Page page,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var formMetadataDto =
        PageDto.builder()
            .pageTitle(page.pageTitle())
            .favicon(page.favicon())
            .title(page.title())
            .subtitle(page.subtitle())
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
                    ? page.badges().stream()
                        .map(BadgeComponentToDtoMapper::mapBadgeToBadgeDto)
                        .toList()
                    : null)
            .kpis(
                page.kpis() != null
                    ? page.kpis().stream().map(KPIComponentToDtoMapper::mapKPIToKPIDto).toList()
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
                    ? page.toolbar().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList()
                    : null)
            .buttons(
                page.buttons() != null
                    ? page.buttons().stream().map(FormComponentToDtoMapper::mapToButtonDto).toList()
                    : null)
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
