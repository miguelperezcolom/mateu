package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.AccordionLayoutDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class AccordionLayoutComponentToDtoMapper {

  public static ComponentDto mapAccordionLayoutToDto(
      AccordionLayout accordionLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = AccordionLayoutDto.builder().build();
    return new ComponentDto(
        metadataDto,
        accordionLayout.id(),
        null,
        accordionLayout.panels().stream()
            .map(tab -> mapComponentToDto(null, tab, baseUrl, route, httpRequest))
            .toList());
  }
}
