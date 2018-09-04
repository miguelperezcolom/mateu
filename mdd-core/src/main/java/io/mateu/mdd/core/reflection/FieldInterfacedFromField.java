package io.mateu.mdd.core.reflection;

import io.mateu.mdd.core.annotations.DataProvider;
import io.mateu.mdd.core.annotations.ValueClass;
import io.mateu.mdd.core.annotations.ValueQL;

import javax.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class FieldInterfacedFromField implements io.mateu.mdd.core.reflection.FieldInterfaced {

    private final Field f;
    private final io.mateu.mdd.core.reflection.FieldInterfaced ff;
    private List<Annotation> extraAnnotations = new ArrayList<>();

    public FieldInterfacedFromField(io.mateu.mdd.core.reflection.FieldInterfaced f, Annotation a) {
        this(f);
        extraAnnotations.add(a);
    }

    @Override
    public Field getField() {
        return f;
    }

    @Override
    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
        return (ff != null)?ff.getDeclaredAnnotationsByType(annotationClass):f.getDeclaredAnnotationsByType(annotationClass);
    }


    public FieldInterfacedFromField(FieldInterfaced f) {
        this.ff = f;
        this.f = f.getField();
    }

    public FieldInterfacedFromField(Field f) {
        this.ff = null;
        this.f = f;
    }

    @Override
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        if (extraAnnotations.size() > 0) {
            for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return true;
        }
        return (ff != null)?ff.isAnnotationPresent(annotationClass):f.isAnnotationPresent(annotationClass);
    }

    @Override
    public Class<?> getType() {
        return (ff != null)?ff.getType():f.getType();
    }

    @Override
    public Class<?> getGenericClass() {
        if (ff != null) return ff.getGenericClass();
        else if (f.getGenericType() != null && f.getGenericType() instanceof ParameterizedType) {

            ParameterizedType genericType = (ParameterizedType) f.getGenericType();
            if (genericType != null && genericType.getActualTypeArguments().length > 0) {
                Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                return genericClass;
            } else return null;

        } else if (f.getGenericType() != null) {
            return (Class<?>) f.getGenericType();
        } else return null;
    }

    @Override
    public Class<?> getDeclaringClass() {
        return (ff != null)?ff.getDeclaringClass():f.getDeclaringClass();
    }

    @Override
    public Type getGenericType() {
        return (ff != null)?ff.getGenericType():f.getGenericType();
    }

    @Override
    public String getName() {
        return (ff != null)?ff.getName():f.getName();
    }

    @Override
    public String getId() {
        return (ff != null)?ff.getId():f.getName();
    }

    @Override
    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
        if (extraAnnotations.size() > 0) {
            for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return (T) a;
        }
        return (ff != null)?ff.getAnnotation(annotationClass):f.getAnnotation(annotationClass);
    }

    @Override
    public Class<?> getOptionsClass() {
        return (ff != null)?ff.getOptionsClass():((f.isAnnotationPresent(ValueClass.class))?f.getAnnotation(ValueClass.class).value():null);
    }

    @Override
    public String getOptionsQL() {
        return (ff != null)?ff.getOptionsQL():((f.isAnnotationPresent(ValueQL.class))?f.getAnnotation(ValueQL.class).value():null);
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
        return f.getModifiers();
    }

    @Override
    public com.vaadin.data.provider.DataProvider getDataProvider() {
        return null;
    }

    @Override
    public Annotation[] getDeclaredAnnotations() {
        return (ff != null)?ff.getDeclaredAnnotations():f.getDeclaredAnnotations();
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
        return hashCode() == obj.hashCode();
    }
}
