package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.KanbanCardDto;
import io.mateu.dtos.KanbanColumnDto;
import io.mateu.dtos.KanbanDto;
import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
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
                                                .map(KanbanMapper::cardDto)
                                                .toList()
                                            : List.of())
                                    .build())
                        .toList()
                    : List.of())
            .moveActionId(kanban.moveActionId())
            .rowsSource(
                kanban.rowsSource() != null
                    ? FieldMapper.mapRestDataSource(kanban.rowsSource())
                    : null)
            .columnField(kanban.columnField())
            .card(kanban.card() != null ? cardDto(kanban.card()) : null)
            .cardColors(kanban.cardColors())
            .cardRoute(kanban.cardRoute())
            .build(),
        kanban.id(),
        List.of(),
        kanban.style(),
        kanban.cssClasses(),
        null);
  }

  private static KanbanCardDto cardDto(KanbanCard card) {
    return KanbanCardDto.builder()
        .id(card.id())
        .title(card.title())
        .description(card.description())
        .badge(card.badge())
        .color(card.color())
        .actionId(card.actionId())
        .build();
  }
}
