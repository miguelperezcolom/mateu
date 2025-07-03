package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ConfirmDialogDto;
import io.mateu.uidl.data.ConfirmDialog;
import java.util.List;

public class ConfirmDialogComponentToDtoMapper {

  public static ClientSideComponentDto mapConfirmDialogToDto(ConfirmDialog confirmDialog) {
    return new ClientSideComponentDto(
        new ConfirmDialogDto(confirmDialog.title(), confirmDialog.text()),
        "fieldId",
        List.of(),
        "",
        "");
  }
}
