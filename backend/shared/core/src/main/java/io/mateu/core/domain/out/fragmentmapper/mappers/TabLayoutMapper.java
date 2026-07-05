package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GroupRelationshipDto;
import io.mateu.dtos.OrientationDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.dtos.TabLayoutVariantDto;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.interfaces.HttpRequest;

public class TabLayoutMapper {

  public static ClientSideComponentDto mapTabLayoutToDto(
      TabLayout tabLayout,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
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
            .groupRelationship(
                tabLayout.groupRelationship() != null
                    ? GroupRelationshipDto.valueOf(tabLayout.groupRelationship().name())
                    : null)
            .adaptable(tabLayout.adaptable())
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        tabLayout.id(),
        tabLayout.tabs().stream()
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
        tabLayout.style(),
        tabLayout.cssClasses(),
        null);
  }
}
