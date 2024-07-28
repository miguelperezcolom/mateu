package io.mateu.core.domain.uidefinition.core.app.menuResolvers;

import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;

public interface MenuEntryFactory {
  MenuEntry buildMenuEntry(Object app, AnnotatedElement f, String caption)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException;
}
