package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ContainerDto;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ContainerComponentToDtoMapper {

  public static ComponentDto mapContainerToDto(
      Container container, String baseUrl, String route, HttpRequest httpRequest) {
    var metadataDto = ContainerDto.builder().build();
    return new ComponentDto(
        metadataDto,
        null,
        null,
        List.of(mapComponentToDto(null, container.content(), baseUrl, route, httpRequest)));
  }
}
