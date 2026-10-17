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
                          .condition(sized(prefix + field.getName(), ">= " + annotation.min()))
                          .message(sizeMessage(annotation))
                          .build());
                }
                if (annotation.max() < Integer.MAX_VALUE) {
                  validations.add(
                      Validation.builder()
                          .fieldId(prefix + field.getName())
                          .condition(sized(prefix + field.getName(), "<= " + annotation.max()))
                          .message(sizeMessage(annotation))
                          .build());
                }
              });
    }
    if (MetaAnnotations.isPresent(field, Min.class)) {
      long minValue = MetaAnnotations.find(field, Min.class).value();
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition(absentOr(prefix + field.getName(), ">= " + minValue))
              .message(minMessage(MetaAnnotations.find(field, Min.class)))
              .build());
    }
    if (MetaAnnotations.isPresent(field, Max.class)) {
      long maxValue = MetaAnnotations.find(field, Max.class).value();
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition(absentOr(prefix + field.getName(), "<= " + maxValue))
              .message(maxMessage(MetaAnnotations.find(field, Max.class)))
              .build());
    }
    if (MetaAnnotations.isPresent(field, Pattern.class)) {
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition(
                  "state['"
                      + prefix
                      + field.getName()
                      + "'] == null || state['"
                      + prefix
                      + field.getName()
                      + "'] === '' || /"
                      + MetaAnnotations.find(field, Pattern.class).regexp()
                      + "/.test(state['"
                      + prefix
                      + field.getName()
                      + "'])")
              .message(patternMessage(MetaAnnotations.find(field, Pattern.class)))
              .build());
    }
    if (MetaAnnotations.isPresent(field, NotEmpty.class)) {
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition(required(prefix + field.getName()))
              .message(notEmptyMessage(MetaAnnotations.find(field, NotEmpty.class)))
              .build());
    }
    if (MetaAnnotations.isPresent(field, NotNull.class)) {
      validations.add(
          Validation.builder()
              .fieldId(prefix + field.getName())
              .condition(required(prefix + field.getName()))
              .message(notNullMessage(MetaAnnotations.find(field, NotNull.class)))
              .build());
    }
    return validations;
  }

  /**
   * The condition of a required field ({@code @NotNull} or {@code @NotEmpty} — the ports have one
   * "required" marker, so both read the same): a value, which a cleared input ({@code ''}), an
   * absent key and an empty list are not — but {@code 0} and {@code false} ARE. The old condition,
   * a bare {@code state['x']}, is falsy for both, so a required count of 0 or a required yes/no
   * left at "no" could never be submitted.
   */
  static String required(String key) {
    var ref = "state['" + key + "']";
    return ref
        + " != null && "
        + ref
        + " !== '' && ("
        + ref
        + ".length === undefined || "
        + ref
        + ".length > 0)";
  }

  /**
   * A bound that only applies to a value: Bean Validation reads null as valid for {@code @Min} /
   * {@code @Max} (requiring it is {@code @NotNull}'s job), so an optional bounded number left empty
   * must pass — it was rejected because {@code null >= 1} is false.
   */
  static String absentOr(String key, String comparison) {
    var ref = "state['" + key + "']";
    return ref + " == null || " + ref + " === '' || " + ref + " " + comparison;
  }

  /**
   * A {@code @Size} bound — like every condition here, one that HOLDS when the value is valid. It
   * used to read {@code state['x'] && state['x'].length < 3}, which holds for a value that is too
   * SHORT: the client passed "ab" (which the server then refused) and refused "abcd". An absent
   * value and one with no length (a number) pass, as on the server ({@link ServerConstraintCheck}).
   */
  static String sized(String key, String comparison) {
    var ref = "state['" + key + "']";
    return ref
        + " == null || "
        + ref
        + " === '' || "
        + ref
        + ".length === undefined || "
        + ref
        + ".length "
        + comparison;
  }

  static String sizeMessage(Size annotation) {
    return message(
        annotation,
        annotation
            .message()
            .replace(
                "{jakarta.validation.constraints.Size.message}",
                "Size must be between " + annotation.min() + " and " + annotation.max()));
  }

  static String minMessage(Min annotation) {
    return message(
        annotation,
        annotation
            .message()
            .replace(
                "{jakarta.validation.constraints.Min.message}",
                "Must be at least " + annotation.value()));
  }

  static String maxMessage(Max annotation) {
    return message(
        annotation,
        annotation
            .message()
            .replace(
                "{jakarta.validation.constraints.Max.message}",
                "Must be at most " + annotation.value()));
  }

  static String patternMessage(Pattern annotation) {
    return message(
        annotation,
        annotation
            .message()
            .replace("{jakarta.validation.constraints.Pattern.message}", "Invalid format"));
  }

  static String notEmptyMessage(NotEmpty annotation) {
    return message(
        annotation,
        annotation
            .message()
            .replace("{jakarta.validation.constraints.NotEmpty.message}", "Cannot be empty"));
  }

  static String notNullMessage(NotNull annotation) {
    return message(
        annotation,
        annotation
            .message()
            .replace("{jakarta.validation.constraints.NotNull.message}", "Cannot be empty"));
  }

  /**
   * A constraint message as the user reads it: its {@code {key}} templates resolved in the
   * REQUEST's language (English when it names none — never the JVM's), then through the Translator.
   * The client's validations and the server's own refusal ({@link ServerConstraintCheck}) both come
   * from here, so they always say the same thing.
   */
  private static String message(java.lang.annotation.Annotation annotation, String text) {
    return TranslatorContext.translate(
        io.mateu.core.infra.ValidationLocale.resolve(
            text,
            annotation,
            io.mateu.core.infra.ValidationLocale.of(TranslatorContext.request())));
  }
}
