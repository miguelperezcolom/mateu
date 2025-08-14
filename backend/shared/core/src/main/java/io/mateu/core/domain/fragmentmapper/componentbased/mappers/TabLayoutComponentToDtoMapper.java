package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.OrientationDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.dtos.TabLayoutVariantDto;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class TabLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapTabLayoutToDto(
      TabLayout tabLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        TabLayoutDto.builder()
            .variant(
                tabLayout.variant() != null
                    ? TabLayoutVariantDto.valueOf(tabLayout.variant().name())
                    : null)
            .orientation(
                tabLayout.orientation() != null
                    ? OrientationDto.valueOf(tabLayout.orientation().name())
                    : null)
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        tabLayout.id(),
        tabLayout.tabs().stream()
            .map(tab -> mapComponentToDto(null, tab, baseUrl, route, httpRequest))
            .toList(),
        tabLayout.style(),
        tabLayout.cssClasses(),
        null);
  }
}
