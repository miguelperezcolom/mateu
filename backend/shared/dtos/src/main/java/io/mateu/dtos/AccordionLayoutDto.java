package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record AccordionLayoutDto(List<AccordionPanelDto> panels, AccordionLayoutVariantDto variant)
    implements ComponentMetadataDto {

  public AccordionLayoutDto {
    panels = Collections.unmodifiableList(panels != null ? panels : Collections.emptyList());
  }

  public List<AccordionPanelDto> panels() {
    return Collections.unmodifiableList(panels);
  }
}
