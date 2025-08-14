package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MasterDetailLayoutDto;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class MasterDetailLayoutComponentToDtoMapper {

  public static ClientSideComponentDto mapMasterDetailLayoutToDto(
      MasterDetailLayout masterDetailLayout,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var metadataDto = MasterDetailLayoutDto.builder().build();
    return new ClientSideComponentDto(
        metadataDto,
        masterDetailLayout.id(),
        List.of(
            mapComponentToDto(null, masterDetailLayout.master(), baseUrl, route, httpRequest),
            mapComponentToDto(null, masterDetailLayout.detail(), baseUrl, route, httpRequest)),
        masterDetailLayout.style(),
        masterDetailLayout.cssClasses(),
        null);
  }
}
