package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ChartDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.Chart;
import java.util.List;

public class ChartComponentToDtoMapper {

  public static ComponentDto mapChartToDto(Chart chart) {
    return new ComponentDto(ChartDto.builder().build(), "fieldId", null, List.of());
  }
}
