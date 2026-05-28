package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isPage;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Validation;
import io.mateu.uidl.interfaces.ValidationDtoSupplier;
import io.mateu.uidl.interfaces.ValidationSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public class ValidationMapper {

  public static List<ValidationDto> mapValidations(Object serverSideObject, String route) {
    if (serverSideObject instanceof ValidationDtoSupplier validationSupplier) {
      return validationSupplier.validationDtos();
    }
    if (serverSideObject instanceof ValidationSupplier validationSupplier) {
      return validationSupplier.validations().stream()
          .map(
              validation ->
                  ValidationDto.builder()
                      .condition(validation.condition())
                      .fieldId(validation.fieldId())
                      .message(validation.message())
                      .build())
          .toList();
    }
    List<ValidationDto> fieldLevelValidations = new ArrayList<>();
    if (isPage(serverSideObject, route) || isForm(serverSideObject)) {
      getAllFields(serverSideObject.getClass()).stream()
          .flatMap(field -> getValidations(field).stream())
          .filter(Objects::nonNull)
          .forEach(fieldLevelValidations::add);
    }
    return Stream.concat(
            fieldLevelValidations.stream(),
            Arrays.stream(serverSideObject.getClass().getAnnotationsByType(Validation.class))
                .map(ValidationMapper::mapToValidation))
        .toList();
  }

  public static List<ValidationDto> getValidations(Field field) {
    return getValidationsWithFieldPrefix("", field);
  }

  public static List<ValidationDto> getValidationsWithFieldPrefix(String prefix, Field field) {
    return ConstraintValidationMapper.getValidationsWithFieldPrefix(prefix, field);
  }

  public static ValidationDto mapToValidation(Validation annotation) {
    return ValidationDto.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }
}
