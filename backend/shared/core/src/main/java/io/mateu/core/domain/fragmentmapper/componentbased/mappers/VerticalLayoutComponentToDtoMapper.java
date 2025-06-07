package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.VerticalLayoutDto;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class VerticalLayoutComponentToDtoMapper {

  public static ComponentDto mapVerticalLayoutToDto(
      VerticalLayout verticalLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = VerticalLayoutDto.builder().build();
    return new ComponentDto(
        metadataDto,
        verticalLayout.id(),
        null,
        verticalLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList());
  }
}
