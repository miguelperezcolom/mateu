package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.HorizontalLayoutDto;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class HorizontalLayoutComponentToDtoMapper {

  public static ComponentDto mapHorizontalLayoutToDto(
      HorizontalLayout horizontalLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = HorizontalLayoutDto.builder().build();
    return new ComponentDto(
        metadataDto,
        horizontalLayout.id(),
        null,
        horizontalLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList());
  }
}
