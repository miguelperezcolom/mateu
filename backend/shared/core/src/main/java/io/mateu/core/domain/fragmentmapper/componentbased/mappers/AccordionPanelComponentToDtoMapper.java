package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.AccordionPanelDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class AccordionPanelComponentToDtoMapper {

  public static ComponentDto mapAccordionPanelToDto(
      AccordionPanel panel, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = AccordionPanelDto.builder().label(panel.label()).build();
    return new ComponentDto(
        metadataDto,
        null,
        null,
        List.of(mapComponentToDto(null, panel.content(), baseUrl, route, httpRequest)));
  }
}
