package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.NoticeDto;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class NoticeMapper {

  public static ClientSideComponentDto mapNoticeToDto(
      Notice notice,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        new NoticeDto(
            notice.text(),
            notice.theme(),
            notice.icon(),
            notice.actionLabel(),
            notice.actionId(),
            notice.slim(),
            notice.fullWidth()),
        notice.id(),
        // arbitrary content travels as slotted children (the HeroSection/Drawer pattern)
        notice.content() != null
            ? notice.content().stream()
                .map(
                    item ->
                        mapComponentToDto(
                            null,
                            item,
                            baseUrl,
                            route,
                            consumedRoute,
                            initiatorComponentId,
                            httpRequest))
                .toList()
            : List.of(),
        notice.style(),
        notice.cssClasses(),
        null);
  }
}
