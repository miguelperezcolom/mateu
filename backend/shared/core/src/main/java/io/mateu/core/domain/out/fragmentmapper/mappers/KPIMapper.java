package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.KPIDto;
import io.mateu.dtos.StatDto;
import io.mateu.uidl.data.KPI;
import java.util.List;

public class KPIMapper {

  /**
   * A KPI on its own (not in a page header) is a title/value pair: it travels as a {@code Stat} —
   * label + value — which every renderer draws. {@code KPIDto} is a page-header record, not a
   * registered wire type: sent as a component it arrived typed "KPIDto" and no renderer knew it.
   */
  public static ClientSideComponentDto mapKPIToDto(KPI kpi) {
    return new ClientSideComponentDto(
        StatDto.builder().label(kpi.title()).value(kpi.text()).spark(List.of()).build(),
        null,
        List.of(),
        kpi.style(),
        kpi.cssClasses(),
        null);
  }

  public static KPIDto mapKPIToKPIDto(KPI kpi) {
    return new KPIDto(kpi.title(), kpi.text(), kpi.style(), kpi.cssClasses());
  }
}
