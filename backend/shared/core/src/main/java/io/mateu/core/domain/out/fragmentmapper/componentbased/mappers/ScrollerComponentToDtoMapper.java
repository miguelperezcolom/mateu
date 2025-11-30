package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ScrollerDto;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ScrollerComponentToDtoMapper {

  public static ClientSideComponentDto mapScrollerToDto(
      Scroller scroller,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto = ScrollerDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        null,
        List.of(
            mapComponentToDto(
                null,
                scroller.content(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        scroller.style(),
        scroller.cssClasses(),
        null);
  }
}
