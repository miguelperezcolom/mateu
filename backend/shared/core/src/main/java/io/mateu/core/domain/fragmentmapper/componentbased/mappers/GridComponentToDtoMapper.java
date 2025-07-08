package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.GridDto;
import io.mateu.uidl.data.Grid;
import java.util.List;

public class GridComponentToDtoMapper {

  public static ClientSideComponentDto mapGridToDto(Grid grid) {
    return new ClientSideComponentDto(
        new GridDto(
            grid.columns().stream()
                .map(column -> new GridColumnDto(column.id(), column.label()))
                .toList(),
            gatePage(grid),
            grid.tree(),
            grid.bindToData()),
        grid.id(),
        List.of(),
        grid.style(),
        grid.cssClasses());
  }

  private static DataPageDto gatePage(Grid grid) {
    if (grid == null) {
      return null;
    }
    if (grid.page() == null) {
      return null;
    }
    return new DataPageDto(grid.page().content(), grid.page().totalElements());
  }
}
