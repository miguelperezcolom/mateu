package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.DetailsDto;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DetailsComponentToDtoMapper {

  public static ComponentDto mapDetailsToDto(
      Details details, String baseUrl, String route, HttpRequest httpRequest) {
    return new ComponentDto(
        new DetailsDto(
            details.title(),
            mapComponentToDto(null, details.content(), baseUrl, route, httpRequest)),
        "fieldId",
        null,
        List.of());
  }
}
