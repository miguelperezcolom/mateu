package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.CalloutCardDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.CalloutCard;
import java.util.List;

public class CalloutCardMapper {

  public static ClientSideComponentDto mapCalloutCardToDto(CalloutCard callout) {
    return new ClientSideComponentDto(
        CalloutCardDto.builder()
            .title(callout.title())
            .description(callout.description())
            .icon(callout.icon())
            .ctaLabel(callout.ctaLabel())
            .actionId(callout.actionId())
            .theme(callout.theme())
            .build(),
        callout.id(),
        List.of(),
        callout.style(),
        callout.cssClasses(),
        null);
  }
}
