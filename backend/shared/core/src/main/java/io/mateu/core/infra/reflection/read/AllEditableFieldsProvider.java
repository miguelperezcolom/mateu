package io.mateu.core.infra.reflection.read;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetter;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import jakarta.inject.Inject;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class AllEditableFieldsProvider {

  private static final Set<String> warnedDroppedFinalFields = ConcurrentHashMap.newKeySet();

  public static List<Field> getAllEditableFields(Class modelType) {
    if (Class.class.equals(modelType)
        || Object.class.equals(modelType)
        || URL.class.equals(modelType)) {
      return new ArrayList<>();
    }
    return getAllEditableFields(modelType, null);
  }

  public static List<Field> getAllEditableFields(Class modelType, Class superType) {
    return getAllEditableFields(modelType, superType, null);
  }

  public static List<Field> getAllEditableFields(Class modelType, Class superType, Field field) {
    return getAllFields(modelType).stream()
        .filter(AllEditableFieldsProvider::isAccessible)
        .filter(AllEditableFieldsProvider::isNotMenu)
        .filter(AllEditableFieldsProvider::isNotInjected)
        .filter(AllEditableFieldsProvider::isNotColumnAction)
        .toList();
  }

  private static boolean isNotColumnAction(Field field) {
    return !ColumnAction.class.equals(field.getType())
        && !ColumnActionGroup.class.equals(field.getType());
  }

  private static boolean isNotMenu(Field field) {
    return !MetaAnnotations.isPresent(field, Menu.class);
  }

  private static boolean isAccessible(Field field) {
    return field.getDeclaringClass().isRecord()
        || !Modifier.isPrivate(field.getModifiers())
        || hasGetter(field);
  }

  private static boolean isNotInjected(Field field) {
    if (MetaAnnotations.isPresent(field, Inject.class)) {
      return false;
    }
    if (!field.getDeclaringClass().isRecord() && Modifier.isFinal(field.getModifiers())) {
      warnFinalFieldDropped(field);
      return false;
    }
    return true;
  }

  // Final fields are treated as injected and silently excluded from forms — surprising when a
  // developer just marks a form field final. Warn once per field so the rule is discoverable;
  // holder fields (Callable/Supplier/Component) and framework internals are intentional, not
  // warned about.
  private static void warnFinalFieldDropped(Field field) {
    var declaringClass = field.getDeclaringClass().getName();
    if (HolderFieldChecker.isNonDataHolder(field)
        || declaringClass.startsWith("io.mateu.core.")
        || declaringClass.startsWith("io.mateu.uidl.")
        || declaringClass.startsWith("io.mateu.dtos.")) {
      return;
    }
    if (warnedDroppedFinalFields.add(field.getDeclaringClass().getName() + "#" + field.getName())) {
      log.warn(
          "Field {}.{} is final, so Mateu treats it as injected and drops it from the form."
              + " Make it non-final if it should be an editable field.",
          field.getDeclaringClass().getSimpleName(),
          field.getName());
    }
  }

  public static boolean hasGetter(Field f) {
    return getMethod(f.getDeclaringClass(), getGetter(f)) != null;
  }
}
