package io.mateu.jpa.domain.ui;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.inbound.menuResolvers.DefaultMenuEntryFactory;
import io.mateu.core.domain.model.inbound.menuResolvers.MenuEntryFactory;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.core.annotations.Columns;
import io.mateu.uidl.core.annotations.EditableFields;
import io.mateu.uidl.core.annotations.FilterFields;
import io.mateu.uidl.core.annotations.Where;
import io.mateu.uidl.core.app.MDDOpenCRUDAction;
import io.mateu.uidl.core.interfaces.JpaCrud;
import io.mateu.uidl.core.interfaces.MenuEntry;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.InvocationTargetException;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
public class JpaMenuEntryFactory extends DefaultMenuEntryFactory implements MenuEntryFactory {

  public JpaMenuEntryFactory(ReflectionService reflectionService) {
    super(reflectionService);
  }

  @Override
  public MenuEntry buildMenuEntry(Object app, AnnotatedElement f, String caption)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    if (JpaCrud.class.isAssignableFrom(reflectionService.getType(f))) {
      Class entityType = getReflectionService().getGenericClass(f, JpaCrud.class, "E");
      if (entityType != null) {
        MDDOpenCRUDAction a = new MDDOpenCRUDAction(caption, entityType);
        JpaCrud v = (JpaCrud) getReflectionService().getValue(f, app);
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
    } else if (Class.class.isAssignableFrom(reflectionService.getType(f))) {
      Class type = (Class) getReflectionService().getValue(f, app);
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
