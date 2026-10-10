package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MatrixCellDto;
import io.mateu.dtos.MatrixColumnDto;
import io.mateu.dtos.MatrixGridDto;
import io.mateu.dtos.MatrixRowDto;
import io.mateu.dtos.MatrixSectionDto;
import io.mateu.uidl.data.MatrixCell;
import io.mateu.uidl.data.MatrixGrid;
import io.mateu.uidl.data.MatrixRow;
import io.mateu.uidl.data.MatrixSection;
import java.util.ArrayList;
import java.util.List;

public class MatrixGridMapper {

  public static ClientSideComponentDto mapMatrixGridToDto(MatrixGrid grid) {
    var columns =
        grid.columns() == null
            ? List.<MatrixColumnDto>of()
            : grid.columns().stream()
                .map(c -> new MatrixColumnDto(c.id(), c.label(), c.group(), c.tone()))
                .toList();
    var sections = new ArrayList<MatrixSectionDto>();
    if (grid.sections() != null) {
      for (int i = 0; i < grid.sections().size(); i++) {
        sections.add(section(grid.sections().get(i), i, columns.size()));
      }
    }
    return new ClientSideComponentDto(
        MatrixGridDto.builder()
            .rowHeaderLabel(grid.rowHeaderLabel())
            .columns(columns)
            .sections(sections)
            .cellActionId(grid.cellActionId())
            .editActionId(grid.editActionId())
            .build(),
        grid.id(),
        List.of(),
        grid.style(),
        grid.cssClasses(),
        null);
  }

  private static MatrixSectionDto section(MatrixSection section, int index, int columnCount) {
    var id = section.id() != null && !section.id().isBlank() ? section.id() : "section" + index;
    var rows =
        section.rows() == null
            ? List.<MatrixRowDto>of()
            : section.rows().stream().map(r -> row(r, columnCount)).toList();
    return new MatrixSectionDto(id, section.title(), section.collapsed(), rows);
  }

  /** One cell per column, always: a short row is padded with blanks, a long one cut. */
  private static MatrixRowDto row(MatrixRow row, int columnCount) {
    var cells = new ArrayList<MatrixCellDto>();
    for (int i = 0; i < columnCount; i++) {
      MatrixCell cell = row.cells() != null && i < row.cells().size() ? row.cells().get(i) : null;
      cells.add(
          cell == null
              ? new MatrixCellDto("", null, false)
              : new MatrixCellDto(
                  cell.value() == null ? "" : cell.value(), cell.tone(), cell.link()));
    }
    return new MatrixRowDto(row.id(), row.label(), cells, row.editable(), row.emphasis());
  }
}
