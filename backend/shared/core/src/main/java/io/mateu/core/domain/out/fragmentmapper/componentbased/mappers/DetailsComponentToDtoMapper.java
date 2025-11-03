package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DetailsDto;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DetailsComponentToDtoMapper {

  public static ClientSideComponentDto mapDetailsToDto(
      Details details, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new DetailsDto(
            mapComponentToDto(null, details.summary(), baseUrl, route, httpRequest),
            mapComponentToDto(null, details.content(), baseUrl, route, httpRequest),
            details.opened()),
        "fieldId",
        List.of(),
        details.style(),
        details.cssClasses(),
        null);
  }
}
