package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.BpmnDto;
import io.mateu.dtos.ChartAxisScaleDto;
import io.mateu.dtos.ChartDataDto;
import io.mateu.dtos.ChartDatasetDto;
import io.mateu.dtos.ChartDto;
import io.mateu.dtos.ChartOptionsDto;
import io.mateu.dtos.ChartScalesDto;
import io.mateu.dtos.ChartTypeDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Bpmn;
import io.mateu.uidl.data.Chart;

import java.util.List;

public class BpmnComponentToDtoMapper {

  public static ClientSideComponentDto mapBpmnToDto(Bpmn bpmn) {
    return new ClientSideComponentDto(
        BpmnDto.builder()
            .xml(bpmn.xml())
            .build(),
        "fieldId",
        List.of(),
        bpmn.style(),
        bpmn.cssClasses(),
        null);
  }
}
