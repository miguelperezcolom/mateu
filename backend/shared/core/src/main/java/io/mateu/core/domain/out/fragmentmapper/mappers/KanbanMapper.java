package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.KanbanCardDto;
import io.mateu.dtos.KanbanColumnDto;
import io.mateu.dtos.KanbanDto;
import io.mateu.uidl.data.Kanban;
import java.util.List;

public class KanbanMapper {

  public static ClientSideComponentDto mapKanbanToDto(Kanban kanban) {
    return new ClientSideComponentDto(
        KanbanDto.builder()
            .columns(
                kanban.columns() != null
                    ? kanban.columns().stream()
                        .map(
                            column ->
                                KanbanColumnDto.builder()
                                    .id(column.id())
                                    .title(column.title())
                                    .color(column.color())
                                    .cards(
                                        column.cards() != null
                                            ? column.cards().stream()
                                                .map(
                                                    card ->
                                                        KanbanCardDto.builder()
                                                            .id(card.id())
                                                            .title(card.title())
                                                            .description(card.description())
                                                            .badge(card.badge())
                                                            .color(card.color())
                                                            .actionId(card.actionId())
                                                            .build())
                                                .toList()
                                            : List.of())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        kanban.id(),
        List.of(),
        kanban.style(),
        kanban.cssClasses(),
        null);
  }
}
