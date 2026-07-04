package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.mappers.MetricCardMapper.mapMetricCardToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ScoreboardDto;
import io.mateu.uidl.data.Scoreboard;
import java.util.List;

public class ScoreboardMapper {

  public static ClientSideComponentDto mapScoreboardToDto(Scoreboard scoreboard) {
    List<ComponentDto> metrics =
        scoreboard.metrics() != null
            ? scoreboard.metrics().stream()
                .map(metric -> (ComponentDto) mapMetricCardToDto(metric))
                .toList()
            : List.of();
    return new ClientSideComponentDto(
        ScoreboardDto.builder().build(),
        scoreboard.id(),
        metrics,
        scoreboard.style(),
        scoreboard.cssClasses(),
        null);
  }
}
