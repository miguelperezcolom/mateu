package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.KPIDto;
import io.mateu.uidl.data.KPI;
import java.util.List;

public class KPIComponentToDtoMapper {

  public static ClientSideComponentDto mapKPIToDto(KPI kpi) {
    return new ClientSideComponentDto(
        mapKPIToKPIDto(kpi), "fieldId", List.of(), kpi.style(), kpi.cssClasses(), null);
  }

  public static KPIDto mapKPIToKPIDto(KPI kpi) {
    return new KPIDto(kpi.title(), kpi.text(), kpi.style(), kpi.cssClasses());
  }
}
