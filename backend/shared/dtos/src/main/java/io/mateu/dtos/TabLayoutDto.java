package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record TabLayoutDto(List<TabDto> tabs) implements ComponentMetadataDto {

  public TabLayoutDto {
    tabs = Collections.unmodifiableList(tabs != null ? tabs : Collections.emptyList());
  }

  @Override
  public List<TabDto> tabs() {
    return Collections.unmodifiableList(tabs);
  }
}
