package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.data.Validation;
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

final class ConstraintValidationMapper {

  static List<Validation> getValidationsWithFieldPrefix(String prefix, Field field) {
    List<Validation> validations = new ArrayList<>();
    if (field.isAnnotationPresent(Size.class)) {
      Arrays.stream(field.getAnnotationsByType(Size.class))
          .forEach(
              annotation -> {
                if (annotation.min() > 0) {
                  validations.add(
                      Validation.builder()
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
                      Validation.builder()
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
          Validation.builder()
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
          Validation.builder()
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
          Validation.builder()
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
          Validation.builder()
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
          Validation.builder()
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
}
