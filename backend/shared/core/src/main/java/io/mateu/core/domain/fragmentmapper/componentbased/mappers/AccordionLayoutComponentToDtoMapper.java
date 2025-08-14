package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.AccordionLayoutDto;
import io.mateu.dtos.AccordionLayoutVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class AccordionLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapAccordionLayoutToDto(
      AccordionLayout accordionLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        AccordionLayoutDto.builder()
            .variant(
                accordionLayout.variant() != null
                    ? AccordionLayoutVariantDto.valueOf(accordionLayout.variant().name())
                    : null)
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        accordionLayout.id(),
        accordionLayout.panels().stream()
            .map(tab -> mapComponentToDto(null, tab, baseUrl, route, httpRequest))
            .toList(),
        accordionLayout.style(),
        accordionLayout.cssClasses(),
        null);
  }
}
