package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ChartDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Chart;
import java.util.List;

public class ChartComponentToDtoMapper {

  public static ClientSideComponentDto mapChartToDto(Chart chart) {
    return new ClientSideComponentDto(ChartDto.builder().build(), "fieldId", List.of());
  }
}
