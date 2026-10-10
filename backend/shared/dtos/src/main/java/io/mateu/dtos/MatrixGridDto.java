package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record MatrixGridDto(
    String rowHeaderLabel,
    List<MatrixColumnDto> columns,
    List<MatrixSectionDto> sections,
    String cellActionId,
    String editActionId)
    implements ComponentMetadataDto {

  public MatrixGridDto {
    columns = columns != null ? List.copyOf(columns) : List.of();
    sections = sections != null ? List.copyOf(sections) : List.of();
  }
}
