package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.WorkflowElkDto;
import io.mateu.uidl.data.WorkflowElk;
import java.util.List;

public class WorkflowElkMapper {

  public static ClientSideComponentDto mapWorkflowElkToDto(WorkflowElk workflowElk) {
    return new ClientSideComponentDto(
        WorkflowElkDto.builder()
            .value(workflowElk.value())
            .readOnly(workflowElk.readOnly())
            .build(),
        "fieldId",
        List.of(),
        workflowElk.style(),
        workflowElk.cssClasses(),
        null);
  }
}
