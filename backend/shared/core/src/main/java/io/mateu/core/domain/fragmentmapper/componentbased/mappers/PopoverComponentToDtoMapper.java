package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PopoverDto;
import io.mateu.uidl.data.Popover;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class PopoverComponentToDtoMapper {

  public static ClientSideComponentDto mapPopoverToDto(
      Popover popover, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new PopoverDto(
            mapComponentToDto(null, popover.content(), baseUrl, route, httpRequest),
            mapComponentToDto(null, popover.wrapped(), baseUrl, route, httpRequest)),
        "fieldId",
        List.of(),
        popover.style(),
        popover.cssClasses(),
        null);
  }
}
