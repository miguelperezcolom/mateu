package io.mateu.core.infra.declarative;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.HolderFieldChecker.isNonDataHolder;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

final class FormViewSerializer {

  static Map<String, Object> toMap(Object instance) {
    var map = fromJson(toJson(instance));
    // Callable/Supplier/Component holder fields are UI, not data — drop the entries Jackson
    // produced for them (a lambda serializes as {}) so they never reach the component state.
    getAllFields(instance.getClass()).stream()
        .filter(field -> isNonDataHolder(field))
        .forEach(field -> map.remove(field.getName()));
    getAllFields(instance.getClass()).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !field.getType().isArray()
                    && !Collection.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
                    && !isNonDataHolder(field)
                    && (instance.getClass().isRecord() || !Modifier.isFinal(field.getModifiers())))
        .forEach(
            field -> {
              var value = getValue(field, instance);
              if (value != null) {
                if (value instanceof Class || isBasic(value)) {
                  map.put(field.getName(), value);
                } else {
                  var cleanedNested =
                      toMap(value).entrySet().stream()
                          .filter(entry -> entry.getValue() != null)
                          .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
                  // Replace the Jackson-serialized husk kept under the field name (it still
                  // carries {} entries for the nested instance's own holder fields) with the
                  // CLEANED nested map — rehydration pours this map back into the nested instance
                  // via Jackson, and an unconstructible Callable/Supplier/Component husk would
                  // fail the whole nested object's rehydration.
                  map.put(field.getName(), cleanedNested);
                  map.putAll(
                      cleanedNested.entrySet().stream()
                          .collect(
                              Collectors.toMap(
                                  entry -> field.getName() + "-" + entry.getKey(),
                                  Map.Entry::getValue)));
                }
              }
            });
    return map;
  }

  private FormViewSerializer() {}
}
