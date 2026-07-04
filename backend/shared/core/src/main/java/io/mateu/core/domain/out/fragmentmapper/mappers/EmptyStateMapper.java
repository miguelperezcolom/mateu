package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.uidl.data.EmptyState;
import java.util.List;

public class EmptyStateMapper {

  public static ClientSideComponentDto mapEmptyStateToDto(EmptyState emptyState) {
    return new ClientSideComponentDto(
        EmptyStateDto.builder()
            .icon(emptyState.icon())
            .title(emptyState.title())
            .description(emptyState.description())
            .actionId(emptyState.actionId())
            .actionLabel(emptyState.actionLabel())
            .build(),
        emptyState.id(),
        List.of(),
        emptyState.style(),
        emptyState.cssClasses(),
        null);
  }
}
