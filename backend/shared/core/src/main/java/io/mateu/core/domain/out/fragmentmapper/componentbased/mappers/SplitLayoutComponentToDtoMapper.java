package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.OrientationDto;
import io.mateu.dtos.SplitLayoutDto;
import io.mateu.dtos.SplitLayoutVariantDto;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class SplitLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapSplitLayoutToDto(
      SplitLayout splitLayout, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto =
        SplitLayoutDto.builder()
            .orientation(
                splitLayout.orientation() != null
                    ? OrientationDto.valueOf(splitLayout.orientation().name())
                    : null)
            .variant(
                splitLayout.variant() != null
                    ? SplitLayoutVariantDto.valueOf(splitLayout.variant().name())
                    : null)
            .fullWidth(splitLayout.fullWidth())
            .build();
    return new ClientSideComponentDto(
        metadataDto,
        splitLayout.id(),
        List.of(
            mapComponentToDto(null, splitLayout.master(), baseUrl, route, httpRequest),
            mapComponentToDto(null, splitLayout.detail(), baseUrl, route, httpRequest)),
        splitLayout.style(),
        splitLayout.cssClasses(),
        null);
  }
}
