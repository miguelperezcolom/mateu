package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ResourceGridDto;
import io.mateu.dtos.ResourceItemDto;
import io.mateu.uidl.data.ResourceGrid;
import java.util.List;

public class ResourceGridMapper {

  public static ClientSideComponentDto mapResourceGridToDto(ResourceGrid resourceGrid) {
    return new ClientSideComponentDto(
        ResourceGridDto.builder()
            .actionId(resourceGrid.actionId())
            .columns(resourceGrid.columns())
            .recommendedLabel(resourceGrid.recommendedLabel())
            .items(
                resourceGrid.items() != null
                    ? resourceGrid.items().stream()
                        .map(
                            item ->
                                ResourceItemDto.builder()
                                    .id(item.id())
                                    .title(item.title())
                                    .subtitle(item.subtitle())
                                    .statusLabel(item.statusLabel())
                                    .statusColor(item.statusColor())
                                    .note(item.note())
                                    .noteColor(item.noteColor())
                                    .disabled(item.disabled())
                                    .recommended(item.recommended())
                                    .selected(item.selected())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        resourceGrid.id(),
        List.of(),
        resourceGrid.style(),
        resourceGrid.cssClasses(),
        null);
  }
}
