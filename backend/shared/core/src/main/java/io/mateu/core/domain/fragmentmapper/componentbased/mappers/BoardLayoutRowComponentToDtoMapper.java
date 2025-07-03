package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BoardLayoutRowDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.BoardLayoutRow;
import io.mateu.uidl.interfaces.HttpRequest;

public class BoardLayoutRowComponentToDtoMapper {

  public static ClientSideComponentDto mapBoardLayoutRowToDto(
      BoardLayoutRow boardLayoutRow, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = BoardLayoutRowDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        null,
        boardLayoutRow.content().stream()
            .map(tab -> mapComponentToDto(null, tab, baseUrl, route, httpRequest))
            .toList(),
        "",
        "");
  }
}
