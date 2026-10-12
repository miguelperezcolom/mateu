package io.mateu.core.infra.declarative.orchestrators.crud.actionhandlers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor;
import io.mateu.core.domain.out.componentmapper.PageFormBuilder;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
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
 * <p>On the routed {@code /new} and {@code /{id}/edit} pages the form is a component of its own,
 * whose {@code create}/{@code save} action is validated in the browser before it is sent. In a
 * drawer the form is content of the listing's mediator, which declares those same actions without
 * validation — so a required field left empty was saved as it was, in every crud that edits in a
 * drawer (an {@code editInDrawer()} crud, a capability listing that is Editable but not Navigable).
 * The check runs here instead, on the constraints of the fields the drawer actually shows as inputs
 * (the same rule {@code ValidationMapper} applies for the browser), and a failure keeps the drawer
 * open with the typed values and an error banner naming the fields.
 */
final class DrawerFormValidator {

  private static volatile Validator validator;

  static void validate(boolean creation, HttpRequest httpRequest, Crud<?, ?, ?, ?, ?, ?> crud) {
    Class<?> formClass = creation ? crud.creationFormClass() : crud.editorClass();
    if (formClass == null || httpRequest.runActionRq().componentState() == null) {
      return;
    }
    Object form;
    try {
      form = httpRequest.getComponentState(formClass);
    } catch (RuntimeException cannotHydrate) {
      return;
    }
    if (form == null) {
      return;
    }
    Set<ConstraintViolation<Object>> violations = new LinkedHashSet<>();
    for (var violation : validator().validate(form)) {
      var field = fieldOf(formClass, violation);
      if (field != null && PageFormBuilder.rendersAsInput(field, form, creation, httpRequest)) {
        violations.add(violation);
      }
    }
    if (!violations.isEmpty()) {
      throw new ConstraintViolationException(describe(formClass, violations), violations);
    }
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

  /** The text the browser shows for the same constraint ("Cannot be empty"), when it is default. */
  private static String messageOf(ConstraintViolation<?> violation) {
    var template = violation.getMessageTemplate();
    if (template != null
        && (template.equals("{jakarta.validation.constraints.NotEmpty.message}")
            || template.equals("{jakarta.validation.constraints.NotNull.message}")
            || template.equals("{jakarta.validation.constraints.NotBlank.message}"))) {
      return "Cannot be empty";
    }
    return violation.getMessage();
  }

  private static Validator validator() {
    if (validator == null) {
      // no EL on the classpath (core excludes it): parameter interpolation only, in English like
      // the rest of the framework's own texts
      validator =
          Validation.byProvider(HibernateValidator.class)
              .configure()
              .messageInterpolator(new ParameterMessageInterpolator())
              .defaultLocale(Locale.ENGLISH)
              .buildValidatorFactory()
              .getValidator();
    }
    return validator;
  }

  private DrawerFormValidator() {}
}
