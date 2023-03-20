package io.mateu.mdd.ui;

import com.google.auto.service.AutoService;
import com.google.common.base.Strings;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.menuResolvers.MenuResolver;
import io.mateu.mdd.shared.annotations.Columns;
import io.mateu.mdd.shared.annotations.EditableFields;
import io.mateu.mdd.shared.annotations.FilterFields;
import io.mateu.mdd.shared.annotations.Where;
import io.mateu.mdd.shared.interfaces.JpaCrud;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;

import java.lang.reflect.InvocationTargetException;
import java.util.List;

@AutoService(MenuResolver.class)
public class JpaMenuResolver implements MenuResolver {

    @Override
    public boolean addMenuEntry(Object app, List<MenuEntry> l, FieldInterfaced f, String caption, int order, VaadinIcons icon) throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
        if (JpaCrud.class.isAssignableFrom(f.getType())) {
            Class entityType = ReflectionHelper.getGenericClass(f, JpaCrud.class, "E");
            if (entityType != null) {
                MDDOpenCRUDAction a = new MDDOpenCRUDAction(caption, entityType);
                a.setIcon(icon).setOrder(order);
                JpaCrud v = (JpaCrud) ReflectionHelper.getValue(f, app);
                if (v != null && v.getColumnFields() != null) a.setColumns(String.join(",", v.getColumnFields()));
                if (v != null && v.getVisibleFields() != null) a.setFields(String.join(",", v.getVisibleFields()));
                if (v != null && v.getSearchFilterFields() != null) a.setFilters(String.join(",", v.getSearchFilterFields()));
                if (v != null && v.getReadOnlyFields() != null) a.setReadOnlyFields(String.join(",", v.getReadOnlyFields()));
                if (v != null) a.setCanAdd(v.canAdd());
                if (v != null) a.setCanDelete(v.canDelete());
                if (v != null) a.setReadOnly(v.isReadOnly());
                if (v != null && !Strings.isNullOrEmpty(v.getExtraWhereFilter())) a.setQueryFilters(v.getExtraWhereFilter());
                l.add(a);
            }
        } else if (Class.class.isAssignableFrom(f.getType())) {
            Class type = (Class) ReflectionHelper.getValue(f, app);
            if (type != null) {
                MDDOpenCRUDAction a = new MDDOpenCRUDAction(caption, type);
                a.setIcon(icon).setOrder(order);
                if (f.isAnnotationPresent(Columns.class) && !Strings.isNullOrEmpty(f.getAnnotation(Columns.class).value())) a.setColumns(f.getAnnotation(Columns.class).value());
                if (f.isAnnotationPresent(EditableFields.class) && !Strings.isNullOrEmpty(f.getAnnotation(EditableFields.class).value())) a.setFields(f.getAnnotation(EditableFields.class).value());
                if (f.isAnnotationPresent(FilterFields.class) && !Strings.isNullOrEmpty(f.getAnnotation(FilterFields.class).value())) a.setFilters(f.getAnnotation(FilterFields.class).value());
                if (f.isAnnotationPresent(Where.class) && !Strings.isNullOrEmpty(f.getAnnotation(Where.class).value())) a.setQueryFilters(f.getAnnotation(Where.class).value());
                l.add(a);
            }
        } else {
            return false;
        }
        return true;
    }
}
