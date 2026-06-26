package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.core.infra.reflection.MetaAnnotations;
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
    if (MetaAnnotations.isPresent(field, Size.class)) {
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
                          .message(
                              TranslatorContext.translate(
                                  annotation
                                      .message()
                                      .replace(
                                          "{jakarta.validation.constraints.Size.message}",
                                          "Size must be between "
                                              + annotation.min()
                                              + " and "
                                              + annotation.max())))
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
                          .message(
                              TranslatorContext.translate(
                                  annotation
                                      .message()
                                      .replace(
                                          "{jakarta.validation.constraints.Size.message}",
                                          "Size must be between "
                                              + annotation.min()
                                              + " and "
                                              + annotation.max())))
                          .build());
                }
              });
    }
    if (MetaAnnotations.isPresent(field, Min.class)) {
      long minValue = MetaAnnotations.find(field, Min.class).value();
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition("state['" + prefix + field.getName() + "'] >= " + minValue)
              .message(
                  TranslatorContext.translate(
                      field
                          .getAnnotation(Min.class)
                          .message()
                          .replace(
                              "{jakarta.validation.constraints.Min.message}",
                              "Must be at least " + minValue)))
              .build());
    }
    if (MetaAnnotations.isPresent(field, Max.class)) {
      long maxValue = MetaAnnotations.find(field, Max.class).value();
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition("state['" + prefix + field.getName() + "'] <= " + maxValue)
              .message(
                  TranslatorContext.translate(
                      field
                          .getAnnotation(Max.class)
                          .message()
                          .replace(
                              "{jakarta.validation.constraints.Max.message}",
                              "Must be at most " + maxValue)))
              .build());
    }
    if (MetaAnnotations.isPresent(field, Pattern.class)) {
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition(
                  "/"
                      + MetaAnnotations.find(field, Pattern.class).regexp()
                      + "/.test(state['"
                      + prefix
                      + field.getName()
                      + "'])")
              .message(
                  TranslatorContext.translate(
                      field
                          .getAnnotation(Pattern.class)
                          .message()
                          .replace(
                              "{jakarta.validation.constraints.Pattern.message}",
                              "Invalid format")))
              .build());
    }
    if (MetaAnnotations.isPresent(field, NotEmpty.class)) {
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition("state['" + prefix + field.getName() + "']")
              .message(
                  TranslatorContext.translate(
                      field
                          .getAnnotation(NotEmpty.class)
                          .message()
                          .replace(
                              "{jakarta.validation.constraints.NotEmpty.message}",
                              "Cannot be empty")))
              .build());
    }
    if (MetaAnnotations.isPresent(field, NotNull.class)) {
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition("state['" + prefix + field.getName() + "']")
              .message(
                  TranslatorContext.translate(
                      field
                          .getAnnotation(NotNull.class)
                          .message()
                          .replace(
                              "{jakarta.validation.constraints.NotNull.message}",
                              "Cannot be empty")))
              .build());
    }
    return validations;
  }
}
