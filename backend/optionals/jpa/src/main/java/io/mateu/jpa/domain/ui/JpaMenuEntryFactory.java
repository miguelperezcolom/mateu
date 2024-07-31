package io.mateu.jpa.domain.ui;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.inbound.menuResolvers.DefaultMenuEntryFactory;
import io.mateu.core.domain.model.inbound.menuResolvers.MenuEntryFactory;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.shared.annotations.Columns;
import io.mateu.core.domain.uidefinition.shared.annotations.EditableFields;
import io.mateu.core.domain.uidefinition.shared.annotations.FilterFields;
import io.mateu.core.domain.uidefinition.shared.annotations.Where;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class JpaMenuEntryFactory extends DefaultMenuEntryFactory implements MenuEntryFactory {

  public JpaMenuEntryFactory(ReflectionHelper reflectionHelper) {
    super(reflectionHelper);
  }

  @Override
  public MenuEntry buildMenuEntry(Object app, AnnotatedElement f, String caption)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    if (JpaCrud.class.isAssignableFrom(reflectionHelper.getType(f))) {
      Class entityType = getReflectionHelper().getGenericClass(f, JpaCrud.class, "E");
      if (entityType != null) {
        MDDOpenCRUDAction a = new MDDOpenCRUDAction(caption, entityType);
        JpaCrud v = (JpaCrud) getReflectionHelper().getValue(f, app);
        if (v != null && v.getColumnFields() != null)
          a.setColumns(String.join(",", v.getColumnFields()));
        if (v != null && v.getVisibleFields() != null)
          a.setFields(String.join(",", v.getVisibleFields()));
        if (v != null && v.getSearchFilterFields() != null)
          a.setFilters(String.join(",", v.getSearchFilterFields()));
        if (v != null && v.getReadOnlyFields() != null)
          a.setReadOnlyFields(String.join(",", v.getReadOnlyFields()));
        if (v != null) a.setCanAdd(v.canAdd());
        if (v != null) a.setCanDelete(v.canDelete());
        if (v != null) a.setReadOnly(v.isReadOnly());
        if (v != null && !Strings.isNullOrEmpty(v.getExtraWhereFilter()))
          a.setQueryFilters(v.getExtraWhereFilter());
        return a;
      }
    } else if (Class.class.isAssignableFrom(reflectionHelper.getType(f))) {
      Class type = (Class) getReflectionHelper().getValue(f, app);
      if (type != null) {
        MDDOpenCRUDAction a = new MDDOpenCRUDAction(caption, type);
        if (f.isAnnotationPresent(Columns.class)
            && !Strings.isNullOrEmpty(f.getAnnotation(Columns.class).value()))
          a.setColumns(f.getAnnotation(Columns.class).value());
        if (f.isAnnotationPresent(EditableFields.class)
            && !Strings.isNullOrEmpty(f.getAnnotation(EditableFields.class).value()))
          a.setFields(f.getAnnotation(EditableFields.class).value());
        if (f.isAnnotationPresent(FilterFields.class)
            && !Strings.isNullOrEmpty(f.getAnnotation(FilterFields.class).value()))
          a.setFilters(f.getAnnotation(FilterFields.class).value());
        if (f.isAnnotationPresent(Where.class)
            && !Strings.isNullOrEmpty(f.getAnnotation(Where.class).value()))
          a.setQueryFilters(f.getAnnotation(Where.class).value());
        return a;
      }
    } else {
      return super.buildMenuEntry(app, f, caption);
    }
    return null;
  }
}
