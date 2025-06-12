package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.TabDto;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class TabComponentToDtoMapper {

  public static ComponentDto mapTabToDto(
      Tab tab, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = TabDto.builder().label(tab.label()).build();
    return new ComponentDto(
        metadataDto,
        null,
        null,
        List.of(mapComponentToDto(null, tab.content(), baseUrl, route, httpRequest)));
  }
}
