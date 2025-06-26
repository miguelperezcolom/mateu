package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BoardLayoutRowDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.BoardLayoutRow;
import io.mateu.uidl.interfaces.HttpRequest;

public class BoardLayoutRowComponentToDtoMapper {

  public static ComponentDto mapBoardLayoutRowToDto(
      BoardLayoutRow boardLayoutRow, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = BoardLayoutRowDto.builder().build();
    return new ComponentDto(
        metadataDto,
        null,
        null,
        boardLayoutRow.content().stream()
            .map(tab -> mapComponentToDto(null, tab, baseUrl, route, httpRequest))
            .toList());
  }
}
