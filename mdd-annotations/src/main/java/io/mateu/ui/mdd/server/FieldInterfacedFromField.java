package io.mateu.ui.mdd.server;

import io.mateu.ui.mdd.server.annotations.ValueClass;
import io.mateu.ui.mdd.server.annotations.ValueQL;
import org.apache.commons.beanutils.BeanUtils;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

public class FieldInterfacedFromField implements FieldInterfaced {

    private final Field f;

    @Override
    public Field getField() {
        return f;
    }

    @Override
    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
        return f.getDeclaredAnnotationsByType(annotationClass);
    }


    public FieldInterfacedFromField(FieldInterfaced f) {
        this.f = f.getField();
    }

    public FieldInterfacedFromField(Field f) {
        this.f = f;
    }

    @Override
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        return f.isAnnotationPresent(annotationClass);
    }

    @Override
    public Class<?> getType() {
        return f.getType();
    }

    @Override
    public Class<?> getGenericClass() {
        if (f.getGenericType() != null && f.getGenericType() instanceof ParameterizedType) {

            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
            if (genericType != null && genericType.getActualTypeArguments().length > 0) {
                Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                return genericClass;
            } else return null;

        } else return null;
    }

    @Override
    public Class<?> getDeclaringClass() {
        return f.getDeclaringClass();
    }

    @Override
    public Type getGenericType() {
        return f.getGenericType();
    }

    @Override
    public String getName() {
        return f.getName();
    }

    @Override
    public String getId() {
        return f.getName();
    }

    @Override
    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
        return f.getAnnotation(annotationClass);
    }

    @Override
    public Class<?> getOptionsClass() {
        return (f.isAnnotationPresent(ValueClass.class))?f.getAnnotation(ValueClass.class).value():null;
    }

    @Override
    public String getOptionsQL() {
        return (f.isAnnotationPresent(ValueQL.class))?f.getAnnotation(ValueQL.class).value():null;
    }

    @Override
    public Object getValue(Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        return ERPServiceImpl.getValue(this, o);
    }


    @Override
    public void setValue(Object o, Object v) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        ERPServiceImpl.setValue(this, o, v);
    }
}
