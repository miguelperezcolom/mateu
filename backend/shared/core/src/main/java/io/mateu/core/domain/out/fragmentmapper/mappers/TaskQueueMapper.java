package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ChipDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.QueueGroupDto;
import io.mateu.dtos.QueueItemDto;
import io.mateu.dtos.TaskQueueDto;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import java.util.List;

public class TaskQueueMapper {

  public static ClientSideComponentDto mapTaskQueueToDto(TaskQueue taskQueue) {
    return new ClientSideComponentDto(
        TaskQueueDto.builder()
            .actionId(taskQueue.actionId())
            .groups(
                taskQueue.groups() != null
                    ? taskQueue.groups().stream().map(TaskQueueMapper::mapGroup).toList()
                    : List.of())
            .build(),
        taskQueue.id(),
        List.of(),
        taskQueue.style(),
        taskQueue.cssClasses(),
        null);
  }

  private static QueueGroupDto mapGroup(QueueGroup group) {
    return QueueGroupDto.builder()
        .label(group.label())
        .items(
            group.items() != null
                ? group.items().stream().map(TaskQueueMapper::mapItem).toList()
                : List.of())
        .build();
  }

  private static QueueItemDto mapItem(QueueItem item) {
    return QueueItemDto.builder()
        .id(item.id())
        .title(item.title())
        .caption(item.caption())
        .badges(
            item.badges() != null
                ? item.badges().stream()
                    .map(badge -> new ChipDto(badge.label(), badge.color()))
                    .toList()
                : List.of())
        .selected(item.selected())
        .build();
  }
}
