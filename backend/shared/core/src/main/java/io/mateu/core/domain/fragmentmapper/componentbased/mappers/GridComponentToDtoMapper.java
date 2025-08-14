package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DataPageDto;
import io.mateu.dtos.GridDto;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class GridComponentToDtoMapper {

  public static ClientSideComponentDto mapGridToDto(
      Grid grid, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new GridDto(
            grid.content().stream()
                .map(column -> mapComponentToDto(null, column, baseUrl, route, httpRequest))
                .toList(),
            gatePage(grid),
            grid.tree()),
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
