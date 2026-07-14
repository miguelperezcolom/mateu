package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.TaskProgressDto;
import io.mateu.uidl.data.TaskProgress;
import java.util.List;

public class TaskProgressMapper {

  public static ClientSideComponentDto mapTaskProgressToDto(TaskProgress taskProgress) {
    return new ClientSideComponentDto(
        TaskProgressDto.builder()
            .label(taskProgress.label())
            .total(taskProgress.total())
            .done(taskProgress.done())
            .actionLabel(taskProgress.actionLabel())
            .actionId(taskProgress.actionId())
            .build(),
        taskProgress.id(),
        List.of(),
        taskProgress.style(),
        taskProgress.cssClasses(),
        null);
  }
}
