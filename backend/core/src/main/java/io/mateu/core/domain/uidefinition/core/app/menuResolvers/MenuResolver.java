package io.mateu.core.domain.uidefinition.core.app.menuResolvers;

import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

public interface MenuResolver {
  boolean addMenuEntry(
      Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, String icon)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException;
}
