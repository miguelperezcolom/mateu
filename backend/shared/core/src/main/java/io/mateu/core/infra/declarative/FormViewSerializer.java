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
    // ...and so are the dependencies the view HOLDS — an injected field, or a final one typed by
    // an interface or abstract class (a service, a store port): Jackson serialised them through the
    // view's getters, sending the bean's readable properties to the browser (GA round 2, J3). A
    // final field of a concrete type stays: an immutable entity's constructor reads it back from
    // this map (a crud save's baseline), and the client can no longer write it either way.
    getAllFields(instance.getClass()).stream()
        .filter(field -> isHeldDependency(instance.getClass(), field))
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
                    // transient = framework wiring (e.g. the current request), never state: Jackson
                    // already skips it, and so must this nested-object pass
                    && !Modifier.isTransient(field.getModifiers())
                    && !isHeldDependency(instance.getClass(), field)
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

  /** Whether {@code type} holds a dependency (see {@link #isHeldDependency}). */
  static boolean holdsDependencies(Class<?> type) {
    return HOLDS_DEPENDENCIES.get(type);
  }

  private static final ClassValue<Boolean> HOLDS_DEPENDENCIES =
      new ClassValue<>() {
        @Override
        protected Boolean computeValue(Class<?> type) {
          return getAllFields(type).stream().anyMatch(field -> isHeldDependency(type, field));
        }
      };

  /**
   * A dependency the view HOLDS rather than state it carries — an injected field, or a final one
   * typed by an interface or abstract class (a service, a store port): Jackson serialised them
   * through the view's getters, sending the bean's readable properties to the browser (GA round 2,
   * J3). A final field of a concrete type stays: an immutable entity's constructor reads it back
   * from this map (a crud save's baseline), and the client can no longer write it either way.
   */
  static boolean isHeldDependency(Class<?> owner, java.lang.reflect.Field field) {
    if (owner.isRecord() || Modifier.isStatic(field.getModifiers())) {
      return false;
    }
    return io.mateu.core.application.security.WireTypes.isInjected(field)
        || (Modifier.isFinal(field.getModifiers()) && holdsAnObject(field));
  }

  /** A field typed by an interface or abstract class that is not a value, a collection or a map. */
  private static boolean holdsAnObject(java.lang.reflect.Field field) {
    var type = field.getType();
    return (type.isInterface() || Modifier.isAbstract(type.getModifiers()))
        && !type.isPrimitive()
        && !isBasic(type)
        && !type.isEnum()
        && !type.isArray()
        && !Collection.class.isAssignableFrom(type)
        && !Map.class.isAssignableFrom(type)
        && !isNonDataHolder(field);
  }

  private FormViewSerializer() {}
}
