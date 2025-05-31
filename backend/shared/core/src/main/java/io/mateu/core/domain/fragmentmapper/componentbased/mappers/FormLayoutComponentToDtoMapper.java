package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormLayoutComponentToDtoMapper {

  public static ComponentDto mapFormLayoutToDto(
      FormLayout verticalLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = FormLayoutDto.builder().build();
    return new ComponentDto(
        metadataDto,
        "component_id",
        null,
        verticalLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList());
  }
}
