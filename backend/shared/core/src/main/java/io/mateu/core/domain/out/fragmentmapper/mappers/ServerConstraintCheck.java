package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor;
import io.mateu.core.domain.out.componentmapper.PageFormBuilder;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ValidationSupplier;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Negative;
import jakarta.validation.constraints.NegativeOrZero;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * The server's own check of the constraints a form sends to the client as validations ({@code
 * NotNull}, {@code NotEmpty}, {@code Size}, {@code Min}, {@code Max}, {@code Pattern}, {@code
 * Email}, {@code Positive}, {@code PositiveOrZero}, {@code Negative}, {@code NegativeOrZero},
 * {@code DecimalMin}, {@code DecimalMax}), run before an action the client is told to validate
 * ({@code validationRequired}). The browser is untrusted and not the only client: a tampered
 * request, or any client that does not evaluate the rules, used to reach the action method with
 * whatever it sent.
 *
 * <p>It checks exactly what the client checks and nothing more — the fields {@link
 * ValidationMapper} sends validations for, with the same messages — so a request a well-behaved
 * client lets through is never refused here. A field whose constraint the client relaxes with a
 * {@code @Hidden("expression")} is skipped (the expression is the browser's to evaluate), as is a
 * view that supplies its own validations ({@link ValidationSupplier}).
 */
public final class ServerConstraintCheck {

  private ServerConstraintCheck() {}

  /** "Label: message" for every violated constraint; empty when the instance is valid. */
  public static List<String> violations(Object instance, HttpRequest httpRequest) {
    return violations(
        instance,
        httpRequest,
        httpRequest != null
            && Boolean.TRUE.equals(httpRequest.getAttribute(ValidationMapper.FOR_CREATION_FORM)));
  }

  /**
   * The same, saying which of a CRUD's two editors filled the instance: the creation form does not
   * render {@code @HiddenInCreate} fields, so their constraints are not checked there.
   */
  public static List<String> violations(
      Object instance, HttpRequest httpRequest, boolean forCreationForm) {
    // the messages are the client's — translated, and in the request's language — so the check runs
    // with the translator context a mapping has (an action runs outside one)
    return io.mateu.core.domain.out.componentmapper.TranslatorContext.within(
        httpRequest, () -> check(instance, httpRequest, forCreationForm));
  }

  private static List<String> check(
      Object instance, HttpRequest httpRequest, boolean forCreationForm) {
    var violations = new ArrayList<String>();
    if (instance == null || instance instanceof ValidationSupplier) {
      return violations;
    }
    for (Field field : getAllFields(instance.getClass())) {
      if (Modifier.isStatic(field.getModifiers())) {
        continue;
      }
      var hidden = MetaAnnotations.find(field, Hidden.class);
      if (hidden != null && !hidden.value().isBlank()) {
        continue;
      }
      if (httpRequest != null
          && !PageFormBuilder.rendersAsInput(field, instance, forCreationForm, httpRequest)) {
        continue;
      }
      Object value;
      try {
        value = getValue(field, instance);
      } catch (Exception e) {
        continue;
      }
      for (String message : violatedMessages(field, value)) {
        violations.add(
            FieldMetadataExtractor.getLabel(field, instance, httpRequest) + ": " + message);
      }
    }
    return violations;
  }

  /**
   * The message the browser shows for {@code constraint} — the same text a refusal here gives —, or
   * null for a constraint the client does not check.
   */
  public static String clientMessage(java.lang.annotation.Annotation constraint) {
    if (constraint instanceof NotNull notNull) {
      return ConstraintValidationMapper.notNullMessage(notNull);
    }
    if (constraint instanceof NotEmpty notEmpty) {
      return ConstraintValidationMapper.notEmptyMessage(notEmpty);
    }
    if (constraint instanceof Size size) {
      return ConstraintValidationMapper.sizeMessage(size);
    }
    if (constraint instanceof Min min) {
      return ConstraintValidationMapper.minMessage(min);
    }
    if (constraint instanceof Max max) {
      return ConstraintValidationMapper.maxMessage(max);
    }
    if (constraint instanceof Pattern pattern) {
      return ConstraintValidationMapper.patternMessage(pattern);
    }
    if (constraint instanceof Email email) {
      return ConstraintValidationMapper.emailMessage(email);
    }
    if (constraint instanceof Positive positive) {
      return ConstraintValidationMapper.positiveMessage(positive);
    }
    if (constraint instanceof PositiveOrZero positiveOrZero) {
      return ConstraintValidationMapper.positiveOrZeroMessage(positiveOrZero);
    }
    if (constraint instanceof Negative negative) {
      return ConstraintValidationMapper.negativeMessage(negative);
    }
    if (constraint instanceof NegativeOrZero negativeOrZero) {
      return ConstraintValidationMapper.negativeOrZeroMessage(negativeOrZero);
    }
    if (constraint instanceof DecimalMin decimalMin) {
      return ConstraintValidationMapper.decimalMinMessage(decimalMin);
    }
    if (constraint instanceof DecimalMax decimalMax) {
      return ConstraintValidationMapper.decimalMaxMessage(decimalMax);
    }
    return null;
  }

  static List<String> violatedMessages(Field field, Object value) {
    var messages = new ArrayList<String>();
    var notNull = MetaAnnotations.find(field, NotNull.class);
    if (notNull != null && (isAbsent(value) || length(value) == 0)) {
      messages.add(ConstraintValidationMapper.notNullMessage(notNull));
    }
    var notEmpty = MetaAnnotations.find(field, NotEmpty.class);
    if (notEmpty != null && (isAbsent(value) || length(value) == 0)) {
      messages.add(ConstraintValidationMapper.notEmptyMessage(notEmpty));
    }
    if (!isAbsent(value)) {
      for (Size size : field.getAnnotationsByType(Size.class)) {
        var length = length(value);
        if (length >= 0
            && ((size.min() > 0 && length < size.min())
                || (size.max() < Integer.MAX_VALUE && length > size.max()))) {
          messages.add(ConstraintValidationMapper.sizeMessage(size));
        }
      }
      var min = MetaAnnotations.find(field, Min.class);
      var number = asNumber(value);
      if (min != null && number != null && number.compareTo(BigDecimal.valueOf(min.value())) < 0) {
        messages.add(ConstraintValidationMapper.minMessage(min));
      }
      var max = MetaAnnotations.find(field, Max.class);
      if (max != null && number != null && number.compareTo(BigDecimal.valueOf(max.value())) > 0) {
        messages.add(ConstraintValidationMapper.maxMessage(max));
      }
      var pattern = MetaAnnotations.find(field, Pattern.class);
      if (pattern != null
          && value instanceof CharSequence text
          && !java.util.regex.Pattern.compile(pattern.regexp()).matcher(text).find()) {
        // find(), not matches(): the client tests the same regexp with JS RegExp.test
        messages.add(ConstraintValidationMapper.patternMessage(pattern));
      }
      var email = MetaAnnotations.find(field, Email.class);
      if (email != null
          && value instanceof CharSequence text
          && !ConstraintValidationMapper.emailRegexps(email).stream()
              .allMatch(regexp -> java.util.regex.Pattern.compile(regexp).matcher(text).find())) {
        messages.add(ConstraintValidationMapper.emailMessage(email));
      }
      if (number != null) {
        var sign = number.signum();
        var positive = MetaAnnotations.find(field, Positive.class);
        if (positive != null && sign <= 0) {
          messages.add(ConstraintValidationMapper.positiveMessage(positive));
        }
        var positiveOrZero = MetaAnnotations.find(field, PositiveOrZero.class);
        if (positiveOrZero != null && sign < 0) {
          messages.add(ConstraintValidationMapper.positiveOrZeroMessage(positiveOrZero));
        }
        var negative = MetaAnnotations.find(field, Negative.class);
        if (negative != null && sign >= 0) {
          messages.add(ConstraintValidationMapper.negativeMessage(negative));
        }
        var negativeOrZero = MetaAnnotations.find(field, NegativeOrZero.class);
        if (negativeOrZero != null && sign > 0) {
          messages.add(ConstraintValidationMapper.negativeOrZeroMessage(negativeOrZero));
        }
        var decimalMin = MetaAnnotations.find(field, DecimalMin.class);
        if (decimalMin != null) {
          var cmp = number.compareTo(new BigDecimal(decimalMin.value().trim()));
          if (cmp < 0 || (cmp == 0 && !decimalMin.inclusive())) {
            messages.add(ConstraintValidationMapper.decimalMinMessage(decimalMin));
          }
        }
        var decimalMax = MetaAnnotations.find(field, DecimalMax.class);
        if (decimalMax != null) {
          var cmp = number.compareTo(new BigDecimal(decimalMax.value().trim()));
          if (cmp > 0 || (cmp == 0 && !decimalMax.inclusive())) {
            messages.add(ConstraintValidationMapper.decimalMaxMessage(decimalMax));
          }
        }
      }
    }
    return messages;
  }

  /** What the client state calls absent: null, or a blank input. */
  private static boolean isAbsent(Object value) {
    return value == null || (value instanceof CharSequence text && text.isEmpty());
  }

  /** The length the client's {@code .length} would read; -1 when the value has none. */
  private static int length(Object value) {
    if (value instanceof CharSequence text) return text.length();
    if (value instanceof Collection<?> collection) return collection.size();
    if (value instanceof Map<?, ?> map) return map.size();
    if (value != null && value.getClass().isArray()) return Array.getLength(value);
    return -1;
  }

  private static BigDecimal asNumber(Object value) {
    if (value instanceof BigDecimal decimal) return decimal;
    if (value instanceof Number number) {
      try {
        return new BigDecimal(number.toString());
      } catch (NumberFormatException e) {
        return null;
      }
    }
    return null;
  }

  /** The client condition of a required field (see ConstraintValidationMapper#required). */
  public static String requiredCondition(String fieldId) {
    return ConstraintValidationMapper.required(fieldId);
  }

  /** The title the client gives its own validation toast. */
  public static final String TITLE = "There are validation errors";

  /** Refuses with the client's own wording when the instance breaks a constraint. */
  public static void enforce(Object instance, HttpRequest httpRequest, boolean forCreationForm) {
    var violations = violations(instance, httpRequest, forCreationForm);
    if (!violations.isEmpty()) {
      throw new io.mateu.uidl.UserFacingException(TITLE, describe(violations));
    }
  }

  /** The violations as the one user-facing text the client shows for its own check. */
  public static String describe(List<String> violations) {
    return String.join("\n", violations.stream().map(v -> "• " + v).toList());
  }
}
