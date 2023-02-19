package io.mateu.reflection;

import io.mateu.mdd.shared.annotations.GenericClass;
import io.mateu.mdd.shared.annotations.ValueClass;
import io.mateu.mdd.shared.annotations.ValueQL;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.remote.dtos.Field;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class FieldInterfacedFromRemoteField implements FieldInterfaced {

    private final Field f;

    @Override
    public java.lang.reflect.Field getField() {
        return null;
    }

    @Override
    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
        return null;
    }


    public FieldInterfacedFromRemoteField(Field f) {
        this.f = f;
    }

    @Override
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        return false;
    }

    @Override
    public Class<?> getType() {
        Class t = String.class;
        switch (f.getType()) {
            case "String": return String.class;
            case "int": return int.class;
        }
        return t;
    }

    @Override
    public AnnotatedType getAnnotatedType() {
        return new AnnotatedType() {
            @Override
            public Type getType() {
                return FieldInterfacedFromRemoteField.this.getType();
            }

            @Override
            public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
                return null;
            }

            @Override
            public Annotation[] getAnnotations() {
                return new Annotation[0];
            }

            @Override
            public Annotation[] getDeclaredAnnotations() {
                return new Annotation[0];
            }
        };
    }

    @Override
    public Class<?> getGenericClass() {
        return null;
    }

    @Override
    public Class<?> getDeclaringClass() {
        return null;
    }

    @Override
    public Type getGenericType() {
        return null;
    }

    @Override
    public String getName() {
        return f.getId();
    }

    @Override
    public String getId() {
        return f.getId();
    }

    @Override
    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
        return null;
    }

    @Override
    public Class<?> getOptionsClass() {
        return null;
    }

    @Override
    public String getOptionsQL() {
        return null;
    }

    @Override
    public Object getValue(Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        return ReflectionHelper.getValue(this, o);
    }


    @Override
    public void setValue(Object o, Object v) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        ReflectionHelper.setValue(this, o, v);
    }

    @Override
    public int getModifiers() {
        return 0;
    }

    @Override
    public com.vaadin.data.provider.DataProvider getDataProvider() {
        return null;
    }

    @Override
    public Annotation[] getDeclaredAnnotations() {
        return new Annotation[0];
    }

    @Override
    public String toString() {
        return getName();
    }

    @Override
    public int hashCode() {
        return ("" + getField().getDeclaringClass().getName() + "/" + getField().getName() + "").hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && hashCode() == obj.hashCode());
    }
}
