package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BoardLayoutRowDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.BoardLayoutRow;
import io.mateu.uidl.interfaces.HttpRequest;

public class BoardLayoutRowComponentToDtoMapper {

  public static ClientSideComponentDto mapBoardLayoutRowToDto(
      BoardLayoutRow boardLayoutRow,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto = BoardLayoutRowDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        null,
        boardLayoutRow.content().stream()
            .map(
                tab ->
                    mapComponentToDto(
                        null,
                        tab,
                        baseUrl,
                        route,
                        consumedRoute,
                        initiatorComponentId,
                        httpRequest))
            .toList(),
        boardLayoutRow.style(),
        boardLayoutRow.cssClasses(),
        null);
  }
}
