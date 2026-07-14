package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.HeatCellDto;
import io.mateu.dtos.HeatmapDto;
import io.mateu.uidl.data.Heatmap;
import java.util.List;

public class HeatmapMapper {

  public static ClientSideComponentDto mapHeatmapToDto(Heatmap heatmap) {
    return new ClientSideComponentDto(
        HeatmapDto.builder()
            .cells(
                heatmap.cells() != null
                    ? heatmap.cells().stream()
                        .map(
                            cell ->
                                HeatCellDto.builder()
                                    .date(cell.date() != null ? cell.date().toString() : null)
                                    .value(cell.value())
                                    .label(cell.label())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        heatmap.id(),
        List.of(),
        heatmap.style(),
        heatmap.cssClasses(),
        null);
  }
}
