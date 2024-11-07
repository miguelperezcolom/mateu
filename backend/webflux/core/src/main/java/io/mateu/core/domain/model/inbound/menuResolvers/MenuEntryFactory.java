package io.mateu.core.domain.model.inbound.menuResolvers;

import io.mateu.uidl.core.interfaces.MenuEntry;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;

public interface MenuEntryFactory {
  MenuEntry buildMenuEntry(Object app, AnnotatedElement f, String caption)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException;
}
