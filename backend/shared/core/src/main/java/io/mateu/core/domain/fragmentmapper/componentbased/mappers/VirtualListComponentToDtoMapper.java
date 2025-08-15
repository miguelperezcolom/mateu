package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.VirtualListDto;
import io.mateu.uidl.data.VirtualList;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class VirtualListComponentToDtoMapper {

  public static ClientSideComponentDto mapVirtualListToDto(
      VirtualList virtualList, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new VirtualListDto(
            new DataPageDto(
                virtualList.page().content().stream()
                    .map(item -> mapComponentToDto(null, item, baseUrl, route, httpRequest))
                    .toList(),
                virtualList.page().totalElements())),
        "fieldId",
        List.of(),
        virtualList.style(),
        virtualList.cssClasses(),
        null);
  }
}
