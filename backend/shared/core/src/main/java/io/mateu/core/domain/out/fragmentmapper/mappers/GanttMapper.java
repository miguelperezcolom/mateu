package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GanttDto;
import io.mateu.dtos.GanttTaskDto;
import io.mateu.uidl.data.Gantt;
import java.util.List;

public class GanttMapper {

  public static ClientSideComponentDto mapGanttToDto(Gantt gantt) {
    return new ClientSideComponentDto(
        GanttDto.builder()
            .tasks(
                gantt.tasks() != null
                    ? gantt.tasks().stream()
                        .map(
                            task ->
                                GanttTaskDto.builder()
                                    .id(task.id())
                                    .title(task.title())
                                    .start(task.start() != null ? task.start().toString() : null)
                                    .end(task.end() != null ? task.end().toString() : null)
                                    .progress(task.progress())
                                    .color(task.color())
                                    .build())
                        .toList()
                    : List.of())
            .onTaskSelectionActionId(gantt.onTaskSelectionActionId())
            .build(),
        gantt.id(),
        List.of(),
        gantt.style(),
        gantt.cssClasses(),
        null);
  }
}
