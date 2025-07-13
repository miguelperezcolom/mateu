package io.mateu.dtos;

import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record FormLayoutDto(int columns) implements ComponentMetadataDto {

  @Override
  public int columns() {
    return columns > 0 ? columns : 1;
  }
}
