package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ConfirmDialogDto;
import io.mateu.uidl.data.ConfirmDialog;
import java.util.List;

public class ConfirmDialogComponentToDtoMapper {

  public static ComponentDto mapConfirmDialogToDto(ConfirmDialog confirmDialog) {
    return new ComponentDto(
        new ConfirmDialogDto(confirmDialog.title(), confirmDialog.text()),
        "fieldId",
        null,
        List.of());
  }
}
