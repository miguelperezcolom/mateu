package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MasterDetailLayoutDto;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;

public class MasterDetailLayoutMapper {

  public static ClientSideComponentDto mapMasterDetailLayoutToDto(
      MasterDetailLayout masterDetailLayout,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var metadataDto = MasterDetailLayoutDto.builder().build();
    var children = new ArrayList<ComponentDto>();
    children.add(
        mapComponentToDto(
            null,
            masterDetailLayout.master(),
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest));
    if (masterDetailLayout.detail() != null) {
      children.add(
          mapComponentToDto(
              null,
              masterDetailLayout.detail(),
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest));
    }
    return new ClientSideComponentDto(
        metadataDto,
        masterDetailLayout.id(),
        children,
        masterDetailLayout.style(),
        masterDetailLayout.cssClasses(),
        null);
  }
}
