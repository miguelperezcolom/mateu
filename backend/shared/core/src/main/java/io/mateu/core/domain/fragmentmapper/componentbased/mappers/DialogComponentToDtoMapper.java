package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DialogDto;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DialogComponentToDtoMapper {

  public static ClientSideComponentDto mapDialogToDto(
      Dialog dialog, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        DialogDto.builder()
            .left(dialog.left())
            .top(dialog.top())
            .content(mapComponentToDto(null, dialog.content(), baseUrl, route, httpRequest))
            .draggable(dialog.draggable())
            .footer(mapComponentToDto(null, dialog.footer(), baseUrl, route, httpRequest))
            .header(mapComponentToDto(null, dialog.header(), baseUrl, route, httpRequest))
            .headerTitle(dialog.headerTitle())
            .height(dialog.height())
            .modeless(dialog.modeless())
            .noPadding(dialog.noPadding())
            .resizable(dialog.resizable())
            .width(dialog.width())
            .closeButtonOnHeader(dialog.closeButtonOnHeader())
            .build(),
        "fieldId",
        List.of(),
        dialog.style(),
        dialog.cssClasses(),
        null);
  }
}
