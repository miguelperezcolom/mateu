package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FullWidthDto;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class FullWidthComponentToDtoMapper {

  public static ClientSideComponentDto mapFullWidthToDto(
      FullWidth fullWidth,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto = FullWidthDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        null,
        List.of(
            mapComponentToDto(
                null,
                fullWidth.content(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        fullWidth.style(),
        fullWidth.cssClasses(),
        null);
  }
}
