package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor;
import io.mateu.core.domain.out.componentmapper.PageFormBuilder;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.MessageInterpolator;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.lang.reflect.Field;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.hibernate.validator.HibernateValidator;
import org.hibernate.validator.messageinterpolation.ParameterMessageInterpolator;

/**
 * The bean-validation check of a crud form submitted from a DRAWER.
 *
 * <p>The drawer's form is a component of its own, like the routed {@code /new} and {@code
 * /{id}/edit} pages (CrudDrawerBuilder), so the browser validates it before sending. This is the
 * server's own check behind that — every bean constraint, including the ones the browser cannot
 * evaluate ({@code @Email}…) — on the fields the drawer actually shows as inputs (the same rule
 * {@code ValidationMapper} applies for the browser). A failure keeps the drawer open with the typed
 * values, an error banner naming the fields, and those fields marked invalid.
 */
final class DrawerFormValidator {

  private static final MessageInterpolator interpolator =
      new ParameterMessageInterpolator(java.util.Set.of(), Locale.ENGLISH, false);
  private static volatile ValidatorFactory factory;

  static void validate(boolean creation, HttpRequest httpRequest, Crud<?, ?, ?, ?, ?, ?> crud) {
    Class<?> formClass = creation ? crud.creationFormClass() : crud.editorClass();
    if (formClass == null) {
      return;
    }
    Object form;
    try {
      // the form's own state (it bubbles its save with it as initiatorState), not the crud's
      form =
          io.mateu.uidl.interfaces.MateuInstanceFactory.newInstance(
              formClass,
              io.mateu.core.infra.declarative.orchestrators.crud.CrudFormState.of(httpRequest),
              httpRequest);
    } catch (RuntimeException cannotHydrate) {
      return;
    }
    if (form == null) {
      return;
    }
    Set<ConstraintViolation<Object>> violations = new LinkedHashSet<>();
    for (var violation :
        validator(io.mateu.core.infra.ValidationLocale.of(httpRequest)).validate(form)) {
      var field = fieldOf(formClass, violation);
      if (field != null && PageFormBuilder.rendersAsInput(field, form, creation, httpRequest)) {
        violations.add(violation);
      }
    }
    if (!violations.isEmpty()) {
      var description =
          io.mateu.core.domain.out.componentmapper.TranslatorContext.within(
              httpRequest, () -> describe(formClass, violations));
      throw new ConstraintViolationException(description, violations);
    }
  }

  /**
   * The refused fields as the form's client-side errors ({@code fieldId → messages}): the drawer
   * re-sent with the error banner marks them invalid, exactly as the browser's own check would.
   */
  static java.util.Map<String, java.util.List<String>> fieldErrors(
      Class<?> formClass, ConstraintViolationException failure) {
    var errors = new java.util.LinkedHashMap<String, java.util.List<String>>();
    if (formClass == null || failure.getConstraintViolations() == null) {
      return errors;
    }
    for (var violation : failure.getConstraintViolations()) {
      var field = fieldOf(formClass, violation);
      if (field != null) {
        errors
            .computeIfAbsent(field.getName(), k -> new java.util.ArrayList<>())
            .add(messageOf(violation));
      }
    }
    return errors;
  }

  private static Field fieldOf(Class<?> formClass, ConstraintViolation<?> violation) {
    var path = violation.getPropertyPath() == null ? "" : violation.getPropertyPath().toString();
    var root = path.contains(".") ? path.substring(0, path.indexOf('.')) : path;
    var bracket = root.indexOf('[');
    var name = bracket >= 0 ? root.substring(0, bracket) : root;
    return getAllFields(formClass).stream()
        .filter(field -> field.getName().equals(name))
        .findFirst()
        .orElse(null);
  }

  private static String describe(Class<?> formClass, Set<ConstraintViolation<Object>> violations) {
    return violations.stream()
        .map(
            violation -> {
              var field = fieldOf(formClass, violation);
              return (field != null ? FieldMetadataExtractor.getLabel(field) + ": " : "")
                  + messageOf(violation);
            })
        .distinct()
        .collect(Collectors.joining("\n"));
  }

  /**
   * The text the browser shows for the same constraint ("Cannot be empty", "Size must be
   * between…"), else the validator's own message — interpolated in the request's language.
   */
  private static String messageOf(ConstraintViolation<?> violation) {
    var template = violation.getMessageTemplate();
    if (template != null && template.equals("{jakarta.validation.constraints.NotBlank.message}")) {
      return "Cannot be empty";
    }
    var descriptor = violation.getConstraintDescriptor();
    var client =
        descriptor == null
            ? null
            : io.mateu.core.domain.out.fragmentmapper.mappers.ServerConstraintCheck.clientMessage(
                descriptor.getAnnotation());
    return client != null && !client.contains("{") ? client : violation.getMessage();
  }

  /**
   * A validator whose messages are in {@code locale}. The interpolator is told the language on
   * every call: left to itself it uses its DEFAULT locale, which it takes from the JVM — whatever
   * {@code defaultLocale(...)} the factory was configured with — so a Spanish machine answered
   * every request in Spanish. (No EL on the classpath — core excludes it —: parameter interpolation
   * only.)
   */
  private static Validator validator(Locale locale) {
    if (factory == null) {
      factory =
          Validation.byProvider(HibernateValidator.class)
              .configure()
              .messageInterpolator(interpolator)
              .defaultLocale(Locale.ENGLISH)
              .buildValidatorFactory();
    }
    return factory
        .usingContext()
        .messageInterpolator(new InLocale(interpolator, locale))
        .getValidator();
  }

  /** An interpolator that always answers in one language. */
  private record InLocale(MessageInterpolator delegate, Locale locale)
      implements MessageInterpolator {
    @Override
    public String interpolate(String messageTemplate, Context context) {
      return delegate.interpolate(messageTemplate, context, locale);
    }

    @Override
    public String interpolate(String messageTemplate, Context context, Locale locale) {
      return delegate.interpolate(messageTemplate, context, locale);
    }
  }

  private DrawerFormValidator() {}
}
