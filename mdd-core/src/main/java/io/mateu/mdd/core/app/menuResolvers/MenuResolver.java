package io.mateu.mdd.core.app.menuResolvers;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

public interface MenuResolver {
    boolean addMenuEntry(Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, VaadinIcons icon) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException;
}
