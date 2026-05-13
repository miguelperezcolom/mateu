package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormEditorDto;
import io.mateu.uidl.data.FormEditor;
import java.util.List;

public class FormEditorComponentToDtoMapper {

  public static ClientSideComponentDto mapFormEditorToDto(FormEditor formEditor) {
    return new ClientSideComponentDto(
        FormEditorDto.builder().value(formEditor.value()).build(),
        "fieldId",
        List.of(),
        formEditor.style(),
        formEditor.cssClasses(),
        null);
  }
}
