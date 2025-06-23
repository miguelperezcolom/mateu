package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.TooltipDto;
import io.mateu.uidl.data.Tooltip;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class TooltipComponentToDtoMapper {

  public static ComponentDto mapTooltipToDto(
      Tooltip tooltip, String baseUrl, String route, HttpRequest httpRequest) {
    return new ComponentDto(
        new TooltipDto(
            tooltip.text(),
            mapComponentToDto(null, tooltip.wrapped(), baseUrl, route, httpRequest)),
        "fieldId",
        null,
        List.of());
  }
}
