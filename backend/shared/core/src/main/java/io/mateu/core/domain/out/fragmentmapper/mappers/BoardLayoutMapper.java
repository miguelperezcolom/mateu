package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BoardLayoutDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.BoardLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class BoardLayoutMapper {

  public static ClientSideComponentDto mapBoardLayoutToDto(
      BoardLayout boardLayout,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto = BoardLayoutDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        boardLayout.id(),
        boardLayout.rows().stream()
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
        boardLayout.style(),
        boardLayout.cssClasses(),
        null);
  }
}
