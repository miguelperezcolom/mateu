package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DashboardPanelDto;
import io.mateu.uidl.data.DashboardPanel;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DashboardPanelMapper {

  public static ClientSideComponentDto mapDashboardPanelToDto(
      DashboardPanel dashboardPanel,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var content =
        dashboardPanel.content() != null
            ? mapComponentToDto(
                null,
                dashboardPanel.content(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)
            : null;
    return new ClientSideComponentDto(
        DashboardPanelDto.builder()
            .title(dashboardPanel.title())
            .subtitle(dashboardPanel.subtitle())
            .colSpan(dashboardPanel.colSpan())
            .rowSpan(dashboardPanel.rowSpan())
            .build(),
        dashboardPanel.id(),
        content != null ? List.of(content) : List.of(),
        dashboardPanel.style(),
        dashboardPanel.cssClasses(),
        null);
  }
}
