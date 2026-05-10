package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.WorkflowElkDto;
import io.mateu.uidl.data.WorkflowElk;
import java.util.List;

public class WorkflowElkComponentToDtoMapper {

  public static ClientSideComponentDto mapWorkflowElkToDto(WorkflowElk workflowElk) {
    return new ClientSideComponentDto(
        WorkflowElkDto.builder().value(workflowElk.value()).build(),
        "fieldId",
        List.of(),
        workflowElk.style(),
        workflowElk.cssClasses(),
        null);
  }
}
