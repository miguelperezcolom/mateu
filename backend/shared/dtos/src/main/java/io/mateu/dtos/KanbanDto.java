package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * A kanban board. {@code moveActionId} makes its cards movable (drag and drop, or a "Move to…"
 * menu); {@code rowsSource} + {@code columnField} + {@code card} + {@code cardColors} + {@code
 * cardRoute} make it LIVE: the renderer reads the source and draws one card per item, sorted by
 * {@code orderField} when set (a move then sends the card's new value as {@code _toOrder}).
 */
@Builder
public record KanbanDto(
    List<KanbanColumnDto> columns,
    String moveActionId,
    RestDataSourceDto rowsSource,
    String columnField,
    KanbanCardDto card,
    Map<String, String> cardColors,
    String cardRoute,
    String orderField)
    implements ComponentMetadataDto {

  public KanbanDto {
    columns = Collections.unmodifiableList(columns != null ? columns : Collections.emptyList());
  }

  public KanbanDto(List<KanbanColumnDto> columns) {
    this(columns, null, null, null, null, null, null, null);
  }

  @Override
  public List<KanbanColumnDto> columns() {
    return Collections.unmodifiableList(columns);
  }
}
