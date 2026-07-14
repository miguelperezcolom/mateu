package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ProcessItemDto;
import io.mateu.dtos.ProcessMonitorDto;
import io.mateu.uidl.data.ProcessMonitor;
import java.util.List;

public class ProcessMonitorMapper {

  public static ClientSideComponentDto mapProcessMonitorToDto(ProcessMonitor processMonitor) {
    return new ClientSideComponentDto(
        ProcessMonitorDto.builder()
            .items(
                processMonitor.items() != null
                    ? processMonitor.items().stream()
                        .map(
                            item ->
                                ProcessItemDto.builder()
                                    .id(item.id())
                                    .name(item.name())
                                    .systems(item.systems() != null ? item.systems() : List.of())
                                    .ok(item.ok())
                                    .warnings(item.warnings())
                                    .errors(item.errors())
                                    .status(item.status())
                                    .actionLabel(item.actionLabel())
                                    .actionId(item.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        processMonitor.id(),
        List.of(),
        processMonitor.style(),
        processMonitor.cssClasses(),
        null);
  }
}
