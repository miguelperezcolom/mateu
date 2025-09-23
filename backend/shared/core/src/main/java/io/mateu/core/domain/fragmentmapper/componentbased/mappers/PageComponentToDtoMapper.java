package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class PageComponentToDtoMapper {

  public static ComponentDto mapPageToDto(
      Page page,
      ComponentTreeSupplier componentSupplier,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    var formMetadataDto =
        PageDto.builder()
            .pageTitle(page.pageTitle())
            .favicon(page.favicon())
            .mainContent(mapComponentToDto(null, page.mainContent(), baseUrl, route, httpRequest))
            .build();
    return new ClientSideComponentDto(
        formMetadataDto, page.id(), List.of(), page.style(), page.cssClasses(), null);
  }

  static ButtonDto mapToButtonDto(UserTrigger userTrigger) {
    if (userTrigger == null) return null;
    if (userTrigger instanceof Button button) {
      return ButtonDto.builder()
          .actionId(button.getActionId())
          .label(button.label())
          .iconOnLeft(button.iconOnLeft())
          .iconOnRight(button.iconOnRight())
          .disabled(button.disabled())
          .build();
    }
    return null;
  }
}
