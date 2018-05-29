package io.mateu.mdd.core.reflection;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;

/**
 * Created by miguel on 22/2/17.
 */
public interface FieldInterfaced {
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass);

    Class<?> getType();

    Class<?> getGenericClass();

    Class<?> getDeclaringClass();

    public Type getGenericType();

    String getName();

    String getId();

    <T extends Annotation> T getAnnotation(Class<T> annotationClass);


    Class<?> getOptionsClass();

    String getOptionsQL();

    Object getValue(Object o) throws NoSuchMethodException, IllegalAccessException, InvocationTargetException;

    String toString();

    Field getField();

    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass);

    public void setValue(Object o, Object v) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException;
}
