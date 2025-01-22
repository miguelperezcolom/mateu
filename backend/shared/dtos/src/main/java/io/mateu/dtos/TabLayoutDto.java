package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
public record TabLayoutDto(List<TabDto> tabs) implements ComponentMetadataDto {

  public TabLayoutDto {
    tabs = Collections.unmodifiableList(tabs);
  }

  @Override
  public List<TabDto> tabs() {
    return Collections.unmodifiableList(tabs);
  }
}
