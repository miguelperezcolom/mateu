package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.Field;
import io.mateu.core.domain.model.reflection.FieldForCheckboxColumn;
import io.mateu.core.domain.model.reflection.FieldFromReflectionField;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;

@Slf4j
@Service
public class ValueWriter {

    private final SetterProvider setterProvider;
    private final GetterProvider getterProvider;
    private final FieldByNameProvider fieldByNameProvider;

    public ValueWriter(SetterProvider setterProvider, GetterProvider getterProvider, FieldByNameProvider fieldByNameProvider) {
        this.setterProvider = setterProvider;
        this.getterProvider = getterProvider;
        this.fieldByNameProvider = fieldByNameProvider;
    }

    public void setValue(Field f, Object o, Object v)
            throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
        if (f == null) {
            return;
        }
        if (f instanceof FieldForCheckboxColumn) {
            f.setValue(o, v);
        } else if (f instanceof FieldFromReflectionField) {
            Method setter = null;
            try {
                setter = o.getClass().getMethod(setterProvider.getSetter(f), f.getType());
            } catch (Exception ignored) {
            }
            try {
                if (setter != null) {
                    setter.invoke(o, v);
                    //                        BeanUtils.setProperty(o, fn, v);
                } else {
                    if (!Modifier.isPublic(f.getField().getModifiers())) f.getField().setAccessible(true);
                    f.getField().set(o, v);
                }
            } catch (IllegalAccessException | InvocationTargetException e) {
                log.error("when setting value for field " + f.getName(), e);
            }
        } else setValue(f.getId(), o, v);
    }

    public void setValue(String fn, Object o, Object v)
            throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
        if (Map.class.isAssignableFrom(o.getClass())) {
            ((Map) o).put(fn, v);
        } else {
            if (fn.contains(".")) {
                o = getInstance(o, fn.substring(0, fn.indexOf(".")));
                setValue(fn.substring(fn.indexOf(".") + 1), o, v);
            } else {
                if (v instanceof Collection) {
                    if (v instanceof List) v = new ArrayList((Collection) v);
                    else if (v instanceof Set) v = new HashSet((Collection) v);
                }

                Field f = fieldByNameProvider.getFieldByName(o.getClass(), fn);

                setValue(f, o, v);
            }
        }
    }

    private Object getInstance(Object o, String fn)
            throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Object x = null;
        if (o != null) {
            if (fn.contains(".")) {
                o = getInstance(o, fn.substring(0, fn.indexOf(".")));
                x = getInstance(o, fn.substring(fn.indexOf(".") + 1));
            } else {
                x = o.getClass().getMethod(getterProvider.getGetter(fn)).invoke(o);
            }
        }
        return x;
    }
}
