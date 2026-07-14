package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.StatDto;
import io.mateu.uidl.data.Stat;
import java.util.List;

public class StatMapper {

  public static ClientSideComponentDto mapStatToDto(Stat stat) {
    return new ClientSideComponentDto(
        StatDto.builder()
            .label(stat.label())
            .value(stat.value())
            .unit(stat.unit())
            .delta(stat.delta())
            .trend(stat.trend())
            .spark(stat.spark() != null ? stat.spark() : List.of())
            .actionId(stat.actionId())
            .build(),
        stat.id(),
        List.of(),
        stat.style(),
        stat.cssClasses(),
        null);
  }
}
