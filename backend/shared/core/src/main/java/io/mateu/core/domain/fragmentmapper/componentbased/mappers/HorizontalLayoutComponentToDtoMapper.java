package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.HorizontalLayoutDto;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class HorizontalLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapHorizontalLayoutToDto(
      HorizontalLayout horizontalLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = HorizontalLayoutDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        horizontalLayout.id(),
        horizontalLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList(),
        horizontalLayout.style(),
        horizontalLayout.cssClasses());
  }
}
