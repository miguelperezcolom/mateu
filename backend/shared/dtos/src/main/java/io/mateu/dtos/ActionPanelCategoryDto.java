package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record ActionPanelCategoryDto(String title, List<ActionPanelItemDto> actions) {

  public ActionPanelCategoryDto {
    actions = actions != null ? List.copyOf(actions) : List.of();
  }
}
