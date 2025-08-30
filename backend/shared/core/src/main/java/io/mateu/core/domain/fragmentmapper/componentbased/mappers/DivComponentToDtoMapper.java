package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DivDto;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.interfaces.HttpRequest;

public class DivComponentToDtoMapper {

  public static ClientSideComponentDto mapDivToDto(
      Div div, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new DivDto(div.content()),
        "fieldId",
        div.children() != null
            ? div.children().stream()
                .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
                .toList()
            : null,
        div.style(),
        div.cssClasses(),
        null);
  }
}
