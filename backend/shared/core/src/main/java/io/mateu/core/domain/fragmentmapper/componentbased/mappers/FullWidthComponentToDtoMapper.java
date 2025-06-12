package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FullWidthDto;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class FullWidthComponentToDtoMapper {

  public static ComponentDto mapFullWidthToDto(
      FullWidth fullWidth, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = FullWidthDto.builder().build();
    return new ComponentDto(
        metadataDto,
        null,
        null,
        List.of(mapComponentToDto(null, fullWidth.content(), baseUrl, route, httpRequest)));
  }
}
