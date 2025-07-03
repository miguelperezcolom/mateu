package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.VirtualListDto;
import io.mateu.uidl.data.VirtualList;
import java.util.List;

public class VirtualListComponentToDtoMapper {

  public static ClientSideComponentDto mapVirtualListToDto(VirtualList virtualList) {
    return new ClientSideComponentDto(
        new VirtualListDto(
            new DataPageDto(virtualList.page().content(), virtualList.page().totalElements())),
        "fieldId",
        List.of(),
        "",
        "");
  }
}
