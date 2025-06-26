package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record BoardLayoutDto(List<BoardLayoutRowDto> rows) implements ComponentMetadataDto {

  public BoardLayoutDto {
    rows = Collections.unmodifiableList(rows != null ? rows : Collections.emptyList());
  }

  @Override
  public List<BoardLayoutRowDto> rows() {
    return Collections.unmodifiableList(rows);
  }
}
