package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DashboardLayoutDto;
import io.mateu.uidl.data.DashboardLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DashboardLayoutMapper {

  public static ClientSideComponentDto mapDashboardLayoutToDto(
      DashboardLayout dashboardLayout,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        DashboardLayoutDto.builder().columns(dashboardLayout.columns()).build(),
        dashboardLayout.id(),
        dashboardLayout.items() != null
            ? dashboardLayout.items().stream()
                .map(
                    item ->
                        mapComponentToDto(
                            null,
                            item,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest))
                .toList()
            : List.of(),
        dashboardLayout.style(),
        dashboardLayout.cssClasses(),
        null);
  }
}
