package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MetricCardDto;
import io.mateu.dtos.MetricTrendDto;
import io.mateu.uidl.data.MetricCard;
import java.util.List;

public class MetricCardMapper {

  public static ClientSideComponentDto mapMetricCardToDto(MetricCard metricCard) {
    return new ClientSideComponentDto(
        MetricCardDto.builder()
            .title(metricCard.title())
            .value(metricCard.value())
            .unit(metricCard.unit())
            .trend(
                metricCard.trend() != null
                    ? MetricTrendDto.valueOf(metricCard.trend().name())
                    : null)
            .trendLabel(metricCard.trendLabel())
            .icon(metricCard.icon())
            .description(metricCard.description())
            .actionId(metricCard.actionId())
            .build(),
        metricCard.id(),
        List.of(),
        metricCard.style(),
        metricCard.cssClasses(),
        null);
  }
}
