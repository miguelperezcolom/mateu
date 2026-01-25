package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.BadgeColorDto;
import io.mateu.dtos.BadgeDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Badge;
import java.util.List;

public class BadgeComponentToDtoMapper {

  public static ClientSideComponentDto mapBadgeToDto(Badge badge) {
    return new ClientSideComponentDto(
        mapBadgeToBadgeDto(badge),
        "fieldId",
        List.of(),
        badge.style(),
        badge.cssClasses(),
        null);
  }

  public static BadgeDto mapBadgeToBadgeDto(Badge badge) {
    return new BadgeDto(
                    badge.text(),
                    badge.iconOnLeft(),
                    badge.iconOnRight(),
                    BadgeColorDto.valueOf(badge.color().name()),
                    badge.primary(),
                    badge.small(),
                    badge.pill());
  }
}
