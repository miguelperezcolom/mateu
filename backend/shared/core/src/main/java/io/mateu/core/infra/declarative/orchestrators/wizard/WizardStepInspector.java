package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.getValidations;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper;
import io.mateu.uidl.data.Validation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

final class WizardStepInspector {

  static List<Field> getStepFields(Wizard wizard) {
    return getAllFields(wizard.getClass()).stream()
        .filter(field -> WizardStep.class.isAssignableFrom(field.getType()))
        .toList();
  }

  static int numberOfSteps(Wizard wizard) {
    return getStepFields(wizard).size();
  }

  static Field currentStepField(Wizard wizard) {
    return getStepFields(wizard).get(wizard.position);
  }

  static Object getValueOrClass(Wizard wizard, int position) {
    var steps = getStepFields(wizard);
    var field = steps.get(position);
    var value = getValue(field, wizard);
    if (value != null) {
      return value;
    }
    try {
      return field.getType().getDeclaredConstructor().newInstance();
    } catch (Exception e) {
      return field.getType();
    }
  }

  /**
   * Guards the flattened-state modes (ACCUMULATIVE / ACCORDION) against two steps declaring a field
   * with the same name: because every rendered step's fields are hydrated from one shared state map
   * keyed by plain field name, a collision silently makes one step display/overwrite the other's
   * value. Throws a clear, actionable error listing the offending names so the developer renames
   * them.
   */
  static void assertNoFieldNameCollisions(Wizard wizard) {
    var steps = getStepFields(wizard);
    var seenIn = new java.util.HashMap<String, String>();
    var collisions = new java.util.LinkedHashMap<String, List<String>>();
    for (var stepField : steps) {
      var stepClass = stepField.getType();
      for (var f : getAllFields(stepClass)) {
        if (java.lang.reflect.Modifier.isStatic(f.getModifiers())) {
          continue;
        }
        var name = f.getName();
        var previousOwner = seenIn.put(name, stepClass.getSimpleName());
        if (previousOwner != null) {
          collisions
              .computeIfAbsent(name, k -> new ArrayList<>(List.of(previousOwner)))
              .add(stepClass.getSimpleName());
        }
      }
    }
    if (!collisions.isEmpty()) {
      var detail =
          collisions.entrySet().stream()
              .map(e -> "'" + e.getKey() + "' in " + e.getValue())
              .collect(java.util.stream.Collectors.joining("; "));
      throw new IllegalStateException(
          "Wizard "
              + wizard.getClass().getSimpleName()
              + " uses an ACCUMULATIVE/ACCORDION layout, which renders several steps at once into a"
              + " single flattened state map, but these field names are declared in more than one"
              + " step and would collide: "
              + detail
              + ". Rename the colliding fields so each step's fields are uniquely named.");
    }
  }

  /** One "label: value" answer read back from a completed step. */
  record AnswerLine(String label, String value) {}

  /**
   * The non-empty answers a completed step holds, as label/value pairs, for the ACCUMULATIVE recap.
   * Skips static fields and null/blank values so the recap only shows what the user actually filled
   * in. Returns an empty list if the step has no stored instance yet.
   */
  static List<AnswerLine> getAnswerLines(Wizard wizard, int stepIndex) {
    var step = getValueOrClass(wizard, stepIndex);
    if (step instanceof Class) {
      return List.of();
    }
    var lines = new ArrayList<AnswerLine>();
    for (var f : getAllFields(step.getClass())) {
      if (java.lang.reflect.Modifier.isStatic(f.getModifiers())) {
        continue;
      }
      var value = getValue(f, step);
      if (value == null) {
        continue;
      }
      var text = String.valueOf(value);
      if (text.isBlank()) {
        continue;
      }
      lines.add(new AnswerLine(getLabel(f), text));
    }
    return lines;
  }

  static List<Validation> validations(Wizard wizard) {
    List<Validation> fieldLevelValidations = new ArrayList<>();
    var stepClass = getStepFields(wizard).get(wizard.position).getType();
    getAllFields(stepClass).stream()
        .flatMap(field -> getValidations(field).stream())
        .filter(Objects::nonNull)
        .forEach(fieldLevelValidations::add);
    return Stream.concat(
            fieldLevelValidations.stream(),
            Arrays.stream(
                    stepClass.getAnnotationsByType(io.mateu.uidl.annotations.Validation.class))
                .map(ValidationMapper::mapToValidation))
        .toList();
  }

  private WizardStepInspector() {}
}
