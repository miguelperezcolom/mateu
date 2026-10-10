package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DropZoneDto;
import io.mateu.uidl.data.DropZone;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DropZoneMapper {

  public static ClientSideComponentDto mapDropZoneToDto(
      DropZone zone,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new DropZoneDto(
            zone.accept(), zone.actionId(), zone.parameters(), zone.title(), zone.subtitle()),
        zone.id(),
        // the wrapped content travels as children (the Notice/HeroSection pattern)
        zone.content() != null
            ? zone.content().stream()
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
        zone.style(),
        zone.cssClasses(),
        null);
  }
}
