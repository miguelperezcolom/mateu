package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.BadgeColorDto;
import io.mateu.dtos.BadgeDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.data.Badge;
import java.util.List;

public class BadgeComponentToDtoMapper {

  public static ComponentDto mapBadgeToDto(Badge badge) {
    return new ComponentDto(
        new BadgeDto(
            badge.text(),
            badge.iconOnLeft(),
            badge.iconOnRight(),
            BadgeColorDto.valueOf(badge.color().name()),
            badge.primary(),
            badge.small(),
            badge.pill()),
        "fieldId",
        null,
        List.of());
  }
}
