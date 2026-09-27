package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.isRequired;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * The server's own check of a wizard step before it is left: the step's required fields ({@code
 * NotNull}, {@code NotEmpty}, {@code NotBlank} or a {@code RequiredSupplier}) must have a value.
 * The renderers check the same thing in the browser (the {@code next} action is {@code
 * validationRequired}) and mark the fields; this is what keeps a wizard from moving on when a
 * client did not, or could not, check them.
 */
final class WizardStepValidator {

  /** The labels of the step's required fields that are empty; an empty list when there are none. */
  static List<String> missingRequired(Object step, HttpRequest httpRequest) {
    var missing = new ArrayList<String>();
    if (step == null || step instanceof Class<?>) {
      return missing;
    }
    if (MetaAnnotations.isPresent(step.getClass(), ReadOnly.class)) {
      return missing;
    }
    for (Field field : getAllFields(step.getClass())) {
      if (Modifier.isStatic(field.getModifiers())
          || !isRequired(field, step, httpRequest)
          || MetaAnnotations.isPresent(field, ReadOnly.class)
          || isHidden(field, step, httpRequest)) {
        continue;
      }
      Object value;
      try {
        value = getValue(field, step);
      } catch (Exception e) {
        continue;
      }
      if (isEmpty(value)) {
        missing.add(getLabel(field, step, httpRequest));
      }
    }
    return missing;
  }

  private static boolean isHidden(Field field, Object step, HttpRequest httpRequest) {
    if (MetaAnnotations.isPresent(field, Hidden.class)
        && MetaAnnotations.find(field, Hidden.class).value().isEmpty()) {
      return true;
    }
    return step instanceof VisibilitySupplier vs && vs.isHidden(field.getName(), httpRequest);
  }

  static boolean isEmpty(Object value) {
    if (value == null) {
      return true;
    }
    if (value instanceof CharSequence text) {
      return text.toString().isBlank();
    }
    if (value instanceof Collection<?> collection) {
      return collection.isEmpty();
    }
    if (value instanceof Map<?, ?> map) {
      return map.isEmpty();
    }
    if (value.getClass().isArray()) {
      return Array.getLength(value) == 0;
    }
    return false;
  }

  private WizardStepValidator() {}
}
