package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.Field;
import io.mateu.core.domain.model.util.data.Pair;
import jakarta.persistence.Entity;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;

@Service
public class IdProvider {

    private final IdFieldProvider idFieldProvider;
    private final ValueProvider valueProvider;

    public IdProvider(IdFieldProvider idFieldProvider, ValueProvider valueProvider) {
        this.idFieldProvider = idFieldProvider;
        this.valueProvider = valueProvider;
    }

    public Object getId(Object model) {
        if (model instanceof Object[]) return ((Object[]) model)[0];
        if (model instanceof Pair) return ((Pair) model).getKey();
        if (model.getClass().isAnnotationPresent(Entity.class)) {
            Object id = null;
            try {
                Field idField = idFieldProvider.getIdField(model.getClass());
                id = valueProvider.getValue(idField, model);
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
            return id;
        } else if (model.getClass().isEnum()) {
            return ((Enum) model).ordinal();
        } else return model;
    }

}
