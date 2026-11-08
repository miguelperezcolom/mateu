package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.HolderFieldChecker.isNonDataHolder;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

final class WizardStateSerializer {

  static Map<String, Object> buildState(Wizard orchestrator) {
    var step = orchestrator.getStep();
    Class<?> stepClass = step instanceof Class ? (Class<?>) step : step.getClass();
    var data = toMap(orchestrator);
    if (!(step instanceof Class)) {
      data.putAll(toMap(step));
    }
    addRowNumber(stepClass, data);
    return data;
  }

  static Map<String, Object> toMap(Object instance) {
    var map = fromJson(toJson(instance));
    // Callable/Supplier/Component holder fields are UI, not data — drop the entries Jackson
    // produced for them (a lambda serializes as {}) so they never reach the component state.
    // Without this the reflection loop below would even INVOKE the holder and merge the built
    // component's fields into the wizard state unprefixed.
    getAllFields(instance.getClass()).stream()
        .filter(field -> isNonDataHolder(field))
        .forEach(field -> map.remove(field.getName()));
    var ownFieldNames =
        getAllFields(instance.getClass()).stream()
            .filter(field -> !Modifier.isStatic(field.getModifiers()))
            .map(java.lang.reflect.Field::getName)
            .collect(Collectors.toSet());
    getAllFields(instance.getClass()).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !Collection.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
                    && !isNonDataHolder(field)
                    // transient = framework wiring (e.g. the current request), never state: Jackson
                    // already skips it, and so must this nested-object pass
                    && !Modifier.isTransient(field.getModifiers())
                    && !Modifier.isFinal(field.getModifiers()))
        .forEach(
            field -> {
              var value = getValue(field, instance);
              if (value != null) {
                if (value instanceof Class || value instanceof Enum<?> || isBasic(value)) {
                  map.put(field.getName(), value);
                } else {
                  var nestedMap =
                      toMap(value).entrySet().stream()
                          .filter(entry -> entry.getValue() != null)
                          .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
                  // Replace the Jackson-serialized husk kept under the field name (it still
                  // carries {} entries for the nested instance's holder fields) with the CLEANED
                  // nested map. Hydration rebuilds each non-current step from this nested map, so
                  // an unconstructible Callable/Supplier/Component husk used to fail the whole
                  // step's rehydration and reset it to its field initializers — which is why
                  // cross-step wizard values died on every action.
                  map.put(field.getName(), nestedMap);
                  // Flattened for the forms that read a nested field by its plain name — but never
                  // over one of the OWNER's own fields: a step field named like a field inside its
                  // step (`ArtworkStep artwork` holding `String artwork`) had its nested map
                  // replaced by that String, so the step could not be rebuilt and its other
                  // values (and the branching that reads them) were silently lost.
                  nestedMap.forEach(
                      (key, nestedValue) -> {
                        if (!ownFieldNames.contains(key)) {
                          map.put(key, nestedValue);
                        }
                      });
                }
              }
            });
    return map;
  }

  static void addRowNumber(Class<?> type, Map<String, Object> data) {
    addRowNumber(type, "", data, data);
  }

  static void addRowNumber(
      Class<?> type, String prefix, Map<String, Object> data, Map<String, Object> parentData) {
    getAllFields(type).stream()
        .filter(field -> Collection.class.isAssignableFrom(field.getType()))
        .forEach(
            field -> {
              var rowType =
                  getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");
              if (rowType == null) {
                // Non-List collections (e.g. Set<String>) have no resolvable List row type —
                // without this guard any form carrying one NPEd on every action.
                return;
              }
              parentData.put(prefix + field.getName() + "_rowClass", rowType.getName());
              io.mateu.core.application.security.WireTypes.emitted(rowType.getName());
              var list = data.get(field.getName()) instanceof List<?> l ? l : null;
              if (list != null) {
                for (int i = 0; i < list.size(); i++) {
                  if (list.get(i) instanceof Map map) {
                    map.put("_rowNumber", i);
                    addRowNumber(rowType, prefix + field.getName() + "-", map, parentData);
                  }
                }
              }
            });
  }
}
