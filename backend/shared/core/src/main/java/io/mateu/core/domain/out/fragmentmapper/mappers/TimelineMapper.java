package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.TimelineDto;
import io.mateu.dtos.TimelineItemDto;
import io.mateu.uidl.data.Timeline;
import java.util.List;

public class TimelineMapper {

  public static ClientSideComponentDto mapTimelineToDto(Timeline timeline) {
    return new ClientSideComponentDto(
        TimelineDto.builder()
            .items(
                timeline.items() != null
                    ? timeline.items().stream()
                        .map(
                            item ->
                                TimelineItemDto.builder()
                                    .id(item.id())
                                    .title(item.title())
                                    .description(item.description())
                                    .timestamp(item.timestamp())
                                    .icon(item.icon())
                                    .color(item.color())
                                    .actionId(item.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        timeline.id(),
        List.of(),
        timeline.style(),
        timeline.cssClasses(),
        null);
  }
}
