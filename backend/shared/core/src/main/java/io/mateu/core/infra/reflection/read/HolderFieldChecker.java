package io.mateu.core.infra.reflection.read;

import io.mateu.uidl.fluent.Component;
import java.lang.reflect.Field;
import java.util.concurrent.Callable;
import java.util.function.Supplier;

/**
 * Detects fields that hold UI or behaviour instead of data: Callable, Supplier, Runnable and fluent
 * Component fields. Their value cannot round-trip through the component state (a lambda serializes
 * as an empty object and cannot be rebuilt), so the state serializers skip them and hydration
 * leaves them untouched — otherwise rehydration would null out their initializers, which is why
 * they used to require @JsonIgnore.
 */
public final class HolderFieldChecker {

  public static boolean isNonDataHolder(Field field) {
    return isNonDataHolderType(field.getType());
  }

  public static boolean isNonDataHolderType(Class<?> type) {
    return Callable.class.isAssignableFrom(type)
        || Supplier.class.isAssignableFrom(type)
        || Runnable.class.isAssignableFrom(type)
        || Component.class.isAssignableFrom(type);
  }

  private HolderFieldChecker() {}
}
