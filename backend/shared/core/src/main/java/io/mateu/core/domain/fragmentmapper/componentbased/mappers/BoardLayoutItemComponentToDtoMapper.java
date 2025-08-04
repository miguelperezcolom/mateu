package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.BoardLayoutItemDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.BoardLayoutItem;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Optional;

public class BoardLayoutItemComponentToDtoMapper {

  public static ClientSideComponentDto mapBoardLayoutItemToDto(
      BoardLayoutItem boardLayoutItem, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = BoardLayoutItemDto.builder().boardCols(boardLayoutItem.boardCols()).build();
    return new ClientSideComponentDto(
        metadataDto,
        null,
        Optional.ofNullable(boardLayoutItem.content())
            .map(
                component ->
                    List.of(
                        mapComponentToDto(
                            null, boardLayoutItem.content(), baseUrl, route, httpRequest)))
            .orElse(List.of()),
        boardLayoutItem.style(),
        boardLayoutItem.cssClasses());
  }
}
