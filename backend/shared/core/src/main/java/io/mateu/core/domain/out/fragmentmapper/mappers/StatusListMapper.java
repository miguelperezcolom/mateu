package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.StatusItemDto;
import io.mateu.dtos.StatusListDto;
import io.mateu.uidl.data.StatusList;
import java.util.List;

public class StatusListMapper {

  public static ClientSideComponentDto mapStatusListToDto(StatusList statusList) {
    return new ClientSideComponentDto(
        StatusListDto.builder()
            .items(
                statusList.items() != null
                    ? statusList.items().stream()
                        .map(
                            item ->
                                StatusItemDto.builder()
                                    .id(item.id())
                                    .icon(item.icon())
                                    .avatar(item.avatar())
                                    .title(item.title())
                                    .description(item.description())
                                    .status(item.status())
                                    .statusColor(item.statusColor())
                                    .actionLabel(item.actionLabel())
                                    .actionId(item.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .compact(statusList.compact())
            .build(),
        statusList.id(),
        List.of(),
        statusList.style(),
        statusList.cssClasses(),
        null);
  }
}
