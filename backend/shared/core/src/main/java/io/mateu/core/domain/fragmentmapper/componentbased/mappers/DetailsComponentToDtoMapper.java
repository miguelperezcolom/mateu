package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

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
            details.title(),
            mapComponentToDto(null, details.content(), baseUrl, route, httpRequest)),
        "fieldId",
        List.of(),
        details.style(),
        details.cssClasses());
  }
}
