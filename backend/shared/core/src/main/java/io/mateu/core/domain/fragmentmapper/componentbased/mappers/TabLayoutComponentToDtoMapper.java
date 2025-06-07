package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class TabLayoutComponentToDtoMapper {

  public static ComponentDto mapTabLayoutToDto(
      TabLayout tabLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = TabLayoutDto.builder().build();
    return new ComponentDto(
        metadataDto,
        tabLayout.id(),
        null,
        tabLayout.tabs().stream()
            .map(content -> mapComponentToDto(null, content, baseUrl, route, httpRequest))
            .toList());
  }
}
