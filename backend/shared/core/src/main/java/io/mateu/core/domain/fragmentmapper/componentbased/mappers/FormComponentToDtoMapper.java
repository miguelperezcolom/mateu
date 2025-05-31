package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormDto;
import io.mateu.uidl.fluent.ComponentSupplier;
import io.mateu.uidl.fluent.Form;
import java.util.List;

public class FormComponentToDtoMapper {

  public static ComponentDto mapFormToDto(Form form, ComponentSupplier componentSupplier) {
    var formMetadataDto = FormDto.builder().title(form.title()).subtitle(form.subtitle()).build();
    return new ComponentDto(
        formMetadataDto, "component_id", componentSupplier.getClass().getName(), List.of());
  }
}
