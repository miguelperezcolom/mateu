package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record ActionPanelDto(
    String label,
    String shortcut,
    List<ActionPanelCategoryDto> categories,
    int maxPerCategory,
    boolean hideUnpopulatedToggle)
    implements ComponentMetadataDto {

  public ActionPanelDto {
    categories = categories != null ? List.copyOf(categories) : List.of();
  }
}
