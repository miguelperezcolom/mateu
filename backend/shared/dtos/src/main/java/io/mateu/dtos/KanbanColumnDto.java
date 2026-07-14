package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record KanbanColumnDto(String id, String title, String color, List<KanbanCardDto> cards) {

  public KanbanColumnDto {
    cards = Collections.unmodifiableList(cards != null ? cards : Collections.emptyList());
  }

  @Override
  public List<KanbanCardDto> cards() {
    return Collections.unmodifiableList(cards);
  }
}
