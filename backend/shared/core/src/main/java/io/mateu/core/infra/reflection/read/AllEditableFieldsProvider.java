package io.mateu.core.infra.reflection.read;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetter;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;

import io.mateu.uidl.annotations.Menu;
import jakarta.inject.Inject;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public final class AllEditableFieldsProvider {

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
        .toList();
  }

  private static boolean isNotMenu(Field field) {
    return !field.isAnnotationPresent(Menu.class);
  }

  private static boolean isAccessible(Field field) {
    return field.getDeclaringClass().isRecord()
        || !Modifier.isPrivate(field.getModifiers())
        || hasGetter(field);
  }

  private static boolean isNotInjected(Field field) {
    return !(field.isAnnotationPresent(Inject.class)
        || (!field.getDeclaringClass().isRecord() && Modifier.isFinal(field.getModifiers())));
  }

  public static boolean hasGetter(Field f) {
    return getMethod(f.getDeclaringClass(), getGetter(f)) != null;
  }
}
