package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.uidl.data.FormField;
import java.util.List;

public class FieldComponentToDtoMapper {

  public static ClientSideComponentDto mapFormFieldToDto(FormField formField) {
    return new ClientSideComponentDto(
        FormFieldDto.builder()
            .fieldId(formField.id())
            .label(formField.label())
            .dataType(formField.dataType() != null?formField.dataType().toString():null)
            .stereotype(formField.stereotype() != null?formField.stereotype().toString():null)
            .placeholder(formField.placeholder())
            .description(formField.description())
            .cssClasses(formField.cssClasses())
            .options(
                formField.options().stream()
                    .map(
                        option ->
                            new OptionDto(option.value(), option.label(), option.description()))
                    .toList())
            .initialValue(formField.initialValue())
            .required(formField.required())
            .autofocus(formField.autofocus())
            .build(),
        formField.id(),
        List.of(),
        formField.style(),
        formField.cssClasses(),
        null);
  }
}
