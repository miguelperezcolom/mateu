package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/** Gantt/timeline chart metadata */
@Builder
public record GanttDto(List<GanttTaskDto> tasks, String onTaskSelectionActionId)
    implements ComponentMetadataDto {

  public GanttDto {
    tasks = Collections.unmodifiableList(tasks != null ? tasks : Collections.emptyList());
  }

  @Override
  public List<GanttTaskDto> tasks() {
    return Collections.unmodifiableList(tasks);
  }
}
