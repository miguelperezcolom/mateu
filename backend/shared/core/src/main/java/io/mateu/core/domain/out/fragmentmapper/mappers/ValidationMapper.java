package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isPage;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Validation;
import io.mateu.uidl.interfaces.ValidationSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public class ValidationMapper {

  public static List<ValidationDto> mapValidations(Object serverSideObject, String route) {
    return createValidations(serverSideObject, route).stream()
        .map(ValidationMapper::mapToValidation)
        .toList();
  }

  public static List<io.mateu.uidl.data.Validation> createValidations(
      Object serverSideObject, String route) {
    if (serverSideObject instanceof ValidationSupplier validationSupplier) {
      return validationSupplier.validations();
    }
    List<io.mateu.uidl.data.Validation> fieldLevelValidations = new ArrayList<>();
    if (isPage(serverSideObject, route)
        || isForm(serverSideObject)
        || serverSideObject.getClass().isRecord()) {
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

  public static List<io.mateu.uidl.data.Validation> getValidations(Field field) {
    return getValidationsWithFieldPrefix("", field);
  }

  public static List<io.mateu.uidl.data.Validation> getValidationsWithFieldPrefix(
      String prefix, Field field) {
    List<io.mateu.uidl.data.Validation> validations =
        ConstraintValidationMapper.getValidationsWithFieldPrefix(prefix, field);
    Hidden hidden = field.getAnnotation(Hidden.class);
    if (hidden != null && !hidden.value().isBlank()) {
      validations =
          validations.stream()
              .map(
                  v ->
                      io.mateu.uidl.data.Validation.builder()
                          .fieldId(v.fieldId())
                          .condition("(" + hidden.value() + ") || (" + v.condition() + ")")
                          .message(v.message())
                          .build())
              .toList();
    }
    return validations;
  }

  public static io.mateu.uidl.data.Validation mapToValidation(Validation annotation) {
    return io.mateu.uidl.data.Validation.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }

  public static ValidationDto mapToValidation(io.mateu.uidl.data.Validation annotation) {
    return ValidationDto.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }
}
