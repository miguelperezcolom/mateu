package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.DialogDto;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class DialogComponentToDtoMapper {

  public static ComponentDto mapDialogToDto(
      Dialog dialog, String baseUrl, String route, HttpRequest httpRequest) {
    return new ComponentDto(
        new DialogDto(
            dialog.title(), mapComponentToDto(null, dialog.content(), baseUrl, route, httpRequest)),
        "fieldId",
        null,
        List.of());
  }
}
