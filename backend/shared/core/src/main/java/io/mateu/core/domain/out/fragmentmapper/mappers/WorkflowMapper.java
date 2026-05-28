package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.WorkflowDto;
import io.mateu.uidl.data.Workflow;
import java.util.List;

public class WorkflowMapper {

  public static ClientSideComponentDto mapWorkflowToDto(Workflow workflow) {
    return new ClientSideComponentDto(
        WorkflowDto.builder().value(workflow.value()).build(),
        "fieldId",
        List.of(),
        workflow.style(),
        workflow.cssClasses(),
        null);
  }
}
