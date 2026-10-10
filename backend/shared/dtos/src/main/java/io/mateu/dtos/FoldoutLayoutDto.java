package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * Redwood-style foldout layout. The overview component travels as the child slotted "overview";
 * each panel's content as the child slotted "panel-N" matching the panels list order, and a panel's
 * optional folded-strip digest (its {@code summary}) as the child slotted "summary-N"
 */
@Builder
public record FoldoutLayoutDto(
    List<FoldoutPanelInfoDto> panels,
    String headerTitle,
    List<String> badges,
    String orientation,
    FoldoutNavigationDto navigation,
    String overviewEditActionId)
    implements ComponentMetadataDto {

  public FoldoutLayoutDto {
    panels = Collections.unmodifiableList(panels != null ? panels : Collections.emptyList());
    badges = Collections.unmodifiableList(badges != null ? badges : Collections.emptyList());
  }

  @Override
  public List<FoldoutPanelInfoDto> panels() {
    return Collections.unmodifiableList(panels);
  }
}
