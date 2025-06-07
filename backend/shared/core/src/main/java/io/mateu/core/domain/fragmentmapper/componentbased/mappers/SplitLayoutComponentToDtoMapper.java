package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.HorizontalLayoutDto;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class SplitLayoutComponentToDtoMapper {

  public static ComponentDto mapSplitLayoutToDto(
      SplitLayout splitLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = HorizontalLayoutDto.builder().build();
    return new ComponentDto(
        metadataDto,
        splitLayout.id(),
        null,
        List.of(
            mapComponentToDto(null, splitLayout.master(), baseUrl, route, httpRequest),
            mapComponentToDto(null, splitLayout.detail(), baseUrl, route, httpRequest)));
  }
}
