package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
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
    getAllFields(instance.getClass()).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !Collection.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
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
                  map.putAll(nestedMap);
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
              parentData.put(prefix + field.getName() + "_rowClass", rowType.getName());
              var list = (List<?>) data.get(field.getName());
              if (list != null) {
                for (int i = 0; i < list.size(); i++) {
                  if (list.get(i) instanceof Map map) {
                    map.put("_rowNumber", i);
                    map.put("nombre", "xxxx");
                    addRowNumber(rowType, prefix + field.getName() + "-", map, parentData);
                  }
                }
              }
            });
  }
}
