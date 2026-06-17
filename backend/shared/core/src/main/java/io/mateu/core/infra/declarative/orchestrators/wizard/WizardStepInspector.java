package io.mateu.core.infra.declarative.orchestrators.wizard;

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
    return field.getType();
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
