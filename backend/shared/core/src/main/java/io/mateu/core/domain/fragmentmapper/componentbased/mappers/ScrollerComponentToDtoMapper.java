package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ScrollerDto;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ScrollerComponentToDtoMapper {

  public static ComponentDto mapScrollerToDto(
      Scroller scroller, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = ScrollerDto.builder().build();
    return new ComponentDto(
        metadataDto,
        null,
        null,
        List.of(mapComponentToDto(null, scroller.content(), baseUrl, route, httpRequest)));
  }
}
