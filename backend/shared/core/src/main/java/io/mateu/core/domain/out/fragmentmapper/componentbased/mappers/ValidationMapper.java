package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isPage;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Validation;
import io.mateu.uidl.interfaces.ValidationDtoSupplier;
import io.mateu.uidl.interfaces.ValidationSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
    List<ValidationDto> validations = new ArrayList<>();
    if (field.isAnnotationPresent(Size.class)) {
      Arrays.stream(field.getAnnotationsByType(Size.class))
          .forEach(
              annotation -> {
                if (annotation.min() > 0) {
                  validations.add(
                      ValidationDto.builder()
                          .fieldId(prefix + field.getName())
                          .condition(
                              "state['"
                                  + prefix
                                  + field.getName()
                                  + "'] && state['"
                                  + prefix
                                  + field.getName()
                                  + "'].length < "
                                  + annotation.min())
                          .message(annotation.message())
                          .build());
                }
                if (annotation.max() < Integer.MAX_VALUE) {
                  validations.add(
                      ValidationDto.builder()
                          .fieldId(prefix + field.getName())
                          .condition(
                              "state['"
                                  + prefix
                                  + field.getName()
                                  + "'] && state['"
                                  + prefix
                                  + field.getName()
                                  + "'].length > "
                                  + annotation.max())
                          .message(annotation.message())
                          .build());
                }
              });
    }
    if (field.isAnnotationPresent(Min.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(prefix + field.getName())
              .condition(
                  "state['"
                      + prefix
                      + field.getName()
                      + "'] > "
                      + field.getAnnotation(Min.class).value())
              .message(field.getAnnotation(Min.class).message())
              .build());
    }
    if (field.isAnnotationPresent(Max.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(prefix + field.getName())
              .condition(
                  "state['"
                      + prefix
                      + field.getName()
                      + "'] < "
                      + field.getAnnotation(Max.class).value())
              .message(field.getAnnotation(Max.class).message())
              .build());
    }
    if (field.isAnnotationPresent(Pattern.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(prefix + field.getName())
              .condition(
                  "/"
                      + field.getAnnotation(Pattern.class).regexp()
                      + "/.test(state['"
                      + prefix
                      + field.getName()
                      + "'])")
              .message(field.getAnnotation(Pattern.class).message())
              .build());
    }
    if (field.isAnnotationPresent(NotEmpty.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(prefix + field.getName())
              .condition("state['" + prefix + field.getName() + "']")
              .message(
                  field
                      .getAnnotation(NotEmpty.class)
                      .message()
                      .replace(
                          "{jakarta.validation.constraints.NotEmpty.message}", "Cannot be empty"))
              .build());
    }
    if (field.isAnnotationPresent(NotNull.class)) {
      validations.add(
          ValidationDto.builder()
              .fieldId(prefix + field.getName())
              .condition("state['" + prefix + field.getName() + "']")
              .message(
                  field
                      .getAnnotation(NotNull.class)
                      .message()
                      .replace(
                          "{jakarta.validation.constraints.NotNull.message}", "Cannot be empty"))
              .build());
    }
    return validations;
  }

  public static ValidationDto mapToValidation(Validation annotation) {
    return ValidationDto.builder()
        .fieldId(annotation.fieldId())
        .condition(annotation.condition())
        .message(annotation.message())
        .build();
  }
}
