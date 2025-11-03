package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ChartAxisScaleDto;
import io.mateu.dtos.ChartDataDto;
import io.mateu.dtos.ChartDatasetDto;
import io.mateu.dtos.ChartDto;
import io.mateu.dtos.ChartOptionsDto;
import io.mateu.dtos.ChartScalesDto;
import io.mateu.dtos.ChartTypeDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Chart;
import java.util.List;

public class ChartComponentToDtoMapper {

  public static ClientSideComponentDto mapChartToDto(Chart chart) {
    return new ClientSideComponentDto(
        ChartDto.builder()
            .chartType(
                chart.chartType() != null ? ChartTypeDto.valueOf(chart.chartType().name()) : null)
            .chartData(
                chart.chartData() != null
                    ? ChartDataDto.builder()
                        .labels(chart.chartData().labels())
                        .datasets(
                            chart.chartData().datasets() != null
                                ? chart.chartData().datasets().stream()
                                    .map(
                                        dataset ->
                                            ChartDatasetDto.builder()
                                                .label(dataset.label())
                                                .data(dataset.data())
                                                .build())
                                    .toList()
                                : null)
                        .build()
                    : null)
            .chartOptions(
                chart.chartOptions() != null
                    ? ChartOptionsDto.builder()
                        .maintainAspectRatio(chart.chartOptions().maintainAspectRatio())
                        .scales(
                            chart.chartOptions().scales() != null
                                ? ChartScalesDto.builder()
                                    .y(
                                        chart.chartOptions().scales().y() != null
                                            ? ChartAxisScaleDto.builder()
                                                .beginAtZero(
                                                    chart.chartOptions().scales().y().beginAtZero())
                                                .build()
                                            : null)
                                    .z(
                                        chart.chartOptions().scales().z() != null
                                            ? ChartAxisScaleDto.builder()
                                                .beginAtZero(
                                                    chart.chartOptions().scales().z().beginAtZero())
                                                .build()
                                            : null)
                                    .build()
                                : null)
                        .build()
                    : null)
            .build(),
        "fieldId",
        List.of(),
        chart.style(),
        chart.cssClasses(),
        null);
  }
}
