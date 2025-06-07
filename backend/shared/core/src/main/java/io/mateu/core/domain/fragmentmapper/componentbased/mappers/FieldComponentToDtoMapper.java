package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.data.Field;
import java.util.List;

public class FieldComponentToDtoMapper {

  public static ComponentDto mapFieldToDto(Field field) {
    return new ComponentDto(
        FormFieldDto.builder()
            .id(field.id())
            .label(field.label())
            .dataType(field.dataType().toString())
            .stereotype(field.stereotype().toString())
            .placeholder(field.placeholder())
            .description(field.description())
            .cssClasses(field.cssClasses())
            .build(),
        field.id(),
        null,
        List.of());
  }
}
