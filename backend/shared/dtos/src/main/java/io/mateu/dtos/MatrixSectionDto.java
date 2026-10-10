package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record MatrixSectionDto(
    String id, String title, boolean collapsed, List<MatrixRowDto> rows) {

  public MatrixSectionDto {
    rows = rows != null ? List.copyOf(rows) : List.of();
  }
}
