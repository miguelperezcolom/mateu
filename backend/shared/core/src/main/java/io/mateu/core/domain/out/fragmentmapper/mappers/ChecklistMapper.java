package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ChecklistDto;
import io.mateu.dtos.ChecklistItemDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Checklist;
import java.util.List;

public class ChecklistMapper {

  public static ClientSideComponentDto mapChecklistToDto(Checklist checklist) {
    return new ClientSideComponentDto(
        ChecklistDto.builder()
            .title(checklist.title())
            .items(
                checklist.items() != null
                    ? checklist.items().stream()
                        .map(
                            item ->
                                ChecklistItemDto.builder()
                                    .id(item.id())
                                    .label(item.label())
                                    .done(item.done())
                                    .actionId(item.actionId())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        checklist.id(),
        List.of(),
        checklist.style(),
        checklist.cssClasses(),
        null);
  }
}
