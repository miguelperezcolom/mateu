package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class FormLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapFormLayoutToDto(
      FormLayout formLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = FormLayoutDto.builder().columns(formLayout.columns()).build();
    return new ClientSideComponentDto(
        metadataDto,
        formLayout.id(),
        formLayout.content().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList(),
        formLayout.style(),
        formLayout.cssClasses());
  }
}
