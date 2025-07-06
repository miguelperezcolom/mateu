package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.uidl.data.Field;
import java.util.List;

public class FieldComponentToDtoMapper {

  public static ClientSideComponentDto mapFieldToDto(Field field) {
    return new ClientSideComponentDto(
        FormFieldDto.builder()
            .fieldId(field.id())
            .label(field.label())
            .dataType(field.dataType().toString())
            .stereotype(field.stereotype().toString())
            .placeholder(field.placeholder())
            .description(field.description())
            .cssClasses(field.cssClasses())
            .options(
                field.options().stream()
                    .map(
                        option ->
                            new OptionDto(option.value(), option.label(), option.description()))
                    .toList())
            .initialValue(field.initialValue())
            .bindToData(field.bindToData())
            .build(),
        field.id(),
        List.of(),
        "",
        "");
  }
}
