package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OptionDto;
import io.mateu.dtos.ValidationDto;
import io.mateu.dtos.ValidationTypeDto;
import io.mateu.uidl.data.FieldValidation;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.JsValidation;
import io.mateu.uidl.data.MaxValidation;
import io.mateu.uidl.data.MinValidation;
import io.mateu.uidl.data.PatternValidation;
import java.util.List;
import java.util.Objects;

public class FieldComponentToDtoMapper {

  public static ClientSideComponentDto mapFormFieldToDto(FormField formField) {
    return new ClientSideComponentDto(
        FormFieldDto.builder()
            .fieldId(formField.id())
            .label(formField.label())
            .dataType(formField.dataType().toString())
            .stereotype(formField.stereotype().toString())
            .placeholder(formField.placeholder())
            .description(formField.description())
            .cssClasses(formField.cssClasses())
            .validations(mapValidations(formField.validations()))
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

  private static List<ValidationDto> mapValidations(List<FieldValidation> validations) {
    return validations.stream()
        .filter(Objects::nonNull)
        .map(FieldComponentToDtoMapper::mapValidation)
        .toList();
  }

  private static ValidationDto mapValidation(FieldValidation validation) {
    return new ValidationDto(
        mapValidationType(validation), validation.message(), validation.data());
  }

  private static ValidationTypeDto mapValidationType(FieldValidation validation) {
    return switch (validation) {
      case MaxValidation max -> ValidationTypeDto.Max;
      case MinValidation min -> ValidationTypeDto.Min;
      case PatternValidation pattern -> ValidationTypeDto.Pattern;
      case JsValidation js -> ValidationTypeDto.Js;
      default -> ValidationTypeDto.NotEmpty;
    };
  }
}
