package io.mateu.core.domain.model.reflection.usecases;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

@Slf4j
@Service
public class ValueProvider {

    private final GetterProvider getterProvider;

    public ValueProvider(GetterProvider getterProvider) {
        this.getterProvider = getterProvider;
    }

    public Object getValue(Field f, Object o) {
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

}
