package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldForCheckboxColumn;
import io.mateu.core.domain.model.reflection.fieldabstraction.FieldFromReflectionField;
import java.lang.reflect.*;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ValueProvider {

  private final GetterProvider getterProvider;
  private final FieldByNameProvider fieldByNameProvider;

  public ValueProvider(GetterProvider getterProvider, FieldByNameProvider fieldByNameProvider) {
    this.getterProvider = getterProvider;
    this.fieldByNameProvider = fieldByNameProvider;
  }

  public Object getValue(java.lang.reflect.Field f, Object o) {
    if (f == null) {
      return null;
    }
    Method getter = null;
    try {
      getter = o.getClass().getMethod(getterProvider.getGetter(f));
    } catch (Exception ignored) {

    }
    Object v = null;
    try {
      if (getter != null) v = getter.invoke(o);
      else {
        if (!Modifier.isPublic(f.getModifiers())) f.setAccessible(true);
        v = f.get(o);
      }
    } catch (IllegalAccessException | InvocationTargetException e) {
      log.error("when getting value for field " + f.getName(), e);
    }
    return v;
  }

  public Object getValue(Field f, Object o, Object valueIfNull) {
    Object v = null;
    try {
      v = getValue(f, o);
    } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
      e.printStackTrace();
    }
    return v != null ? v : valueIfNull;
  }

  public Object getValue(Field f, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    if (Map.class.isAssignableFrom(o.getClass())) {
      return ((Map) o).get(f.getName());
    } else if (f instanceof FieldForCheckboxColumn) {
      return f.getValue(o);
    } else {
      return getValue(f.getId(), o);
    }
  }

  public Object getValue(AnnotatedElement e, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    if (e instanceof Field f) {
      if (Map.class.isAssignableFrom(o.getClass())) {
        return ((Map<?, ?>) o).get(f.getName());
      } else if (f instanceof FieldForCheckboxColumn) {
        return f.getValue(o);
      } else {
        return getValue(f.getId(), o);
      }
    } else if (e instanceof Method m) {
      return m.invoke(o);
    } else {
      return null;
    }
  }

  public Object getValue(String id, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    Object v = null;

    if (id.contains(".")) {
      String firstId = id.substring(0, id.indexOf("."));
      String path = id.substring(id.indexOf(".") + 1);

      Method getter = null;
      Field f = fieldByNameProvider.getFieldByName(o.getClass(), firstId);

      if (f != null) {

        try {
          getter = o.getClass().getMethod(getterProvider.getGetter(f.getType(), firstId));
        } catch (Exception e) {

        }

        if (getter != null) v = getter.invoke(o);
        else {
          try {
            if (f instanceof FieldFromReflectionField) {
              java.lang.reflect.Field field = f.getField();
              if (!Modifier.isPublic(field.getModifiers())) {
                field.setAccessible(true);
              }
              v = field.get(o);
            }
          } catch (Exception e) {
            e.printStackTrace();
          }
        }

        if (v != null) {
          v = getValue(path, v);
        }
      }

    } else {
      Field f = fieldByNameProvider.getFieldByName(o.getClass(), id);

      if (f != null) {

        Method getter = null;
        try {
          getter = o.getClass().getMethod(getterProvider.getGetter(f.getType(), id));
        } catch (Exception e) {

        }
        try {
          if (getter != null) v = getter.invoke(o);
          else {
            try {
              if (f instanceof FieldFromReflectionField) {
                java.lang.reflect.Field field = f.getField();
                if (!Modifier.isPublic(field.getModifiers())) {
                  field.setAccessible(true);
                }
                v = field.get(o);
              }
            } catch (Exception e) {
              e.printStackTrace();
            }
          }
        } catch (IllegalAccessException e) {
          e.printStackTrace();
        } catch (InvocationTargetException e) {
          e.printStackTrace();
        }
      }
    }

    return v;
  }
}
