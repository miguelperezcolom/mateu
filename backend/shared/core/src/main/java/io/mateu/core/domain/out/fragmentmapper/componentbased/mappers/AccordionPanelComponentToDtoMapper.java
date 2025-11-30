package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.AccordionPanelDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class AccordionPanelComponentToDtoMapper {

  public static ClientSideComponentDto mapAccordionPanelToDto(
      AccordionPanel panel,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto =
        AccordionPanelDto.builder()
            .label(panel.label())
            .active(panel.active())
            .disabled(panel.disabled())
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        null,
        List.of(
            mapComponentToDto(
                null,
                panel.content(),
                baseUrl,
                route,
                consumedRoute,
                initiatorComponentId,
                httpRequest)),
        panel.style(),
        panel.cssClasses(),
        null);
  }
}
