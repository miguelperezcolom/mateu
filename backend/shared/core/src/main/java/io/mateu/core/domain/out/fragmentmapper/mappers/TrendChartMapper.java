package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.TrendChartDto;
import io.mateu.uidl.data.TrendChart;
import java.util.List;

public class TrendChartMapper {

  public static ClientSideComponentDto mapTrendChartToDto(TrendChart chart) {
    return new ClientSideComponentDto(
        TrendChartDto.builder()
            .title(chart.title())
            .values(chart.values() != null ? chart.values() : List.of())
            .labels(chart.labels() != null ? chart.labels() : List.of())
            .color(chart.color())
            .area(chart.area())
            .build(),
        chart.id(),
        List.of(),
        chart.style(),
        chart.cssClasses(),
        null);
  }
}
