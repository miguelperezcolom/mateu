package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BoardLayoutDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.BoardLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class BoardLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapBoardLayoutToDto(
      BoardLayout boardLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = BoardLayoutDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        boardLayout.id(),
        boardLayout.rows().stream()
            .map(tab -> mapComponentToDto(null, tab, baseUrl, route, httpRequest))
            .toList(),
        boardLayout.style(),
        boardLayout.cssClasses());
  }
}
