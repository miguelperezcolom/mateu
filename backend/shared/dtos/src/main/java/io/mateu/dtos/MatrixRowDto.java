package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

@Builder
public record MatrixRowDto(
    String id, String label, List<MatrixCellDto> cells, boolean editable, boolean emphasis) {

  public MatrixRowDto {
    cells = cells != null ? List.copyOf(cells) : List.of();
  }
}
