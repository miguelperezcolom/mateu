package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ConfirmDialogDto;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public class ConfirmDialogComponentToDtoMapper {

  public static ClientSideComponentDto mapConfirmDialogToDto(
      ConfirmDialog confirmDialog, String baseUrl, String route, HttpRequest httpRequest) {
    return new ClientSideComponentDto(
        ConfirmDialogDto.builder()
            .confirmActionId(confirmDialog.confirmActionId())
            .canCancel(confirmDialog.canCancel())
            .cancelActionId(confirmDialog.cancelActionId())
            .header(confirmDialog.header())
            .canReject(confirmDialog.canReject())
            .confirmText(confirmDialog.confirmText() != null ? confirmDialog.confirmText() : "Save")
            .rejectActionId(confirmDialog.rejectActionId())
            .openedCondition(
                confirmDialog.openedCondition() != null ? confirmDialog.openedCondition() : "true")
            .rejectText(confirmDialog.rejectText())
            .build(),
        "fieldId",
        List.of(mapComponentToDto(null, confirmDialog.content(), baseUrl, route, httpRequest)),
        confirmDialog.style(),
        confirmDialog.cssClasses(),
        null);
  }
}
