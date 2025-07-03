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
            new DataPageDto(grid.page().content(), grid.page().totalElements()),
            grid.tree()),
        "fieldId",
        List.of(),
        "",
        "");
  }
}
