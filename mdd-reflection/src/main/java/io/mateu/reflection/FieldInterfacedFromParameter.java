package io.mateu.reflection;

import com.vaadin.data.provider.DataProvider;
import io.mateu.mdd.shared.annotations.ValueClass;
import io.mateu.mdd.shared.annotations.ValueQL;
import io.mateu.mdd.shared.reflection.FieldInterfaced;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FieldInterfacedFromParameter implements FieldInterfaced {

    private final Parameter p;
    private final Executable m;
    private final FieldInterfacedFromParameter ff;
    private List<Annotation> extraAnnotations = new ArrayList<>();

    public FieldInterfacedFromParameter(FieldInterfacedFromParameter f, Annotation a) {
        this(f);
        extraAnnotations.add(a);
    }

    public Parameter getParameter() {
        return p;
    }

    public Executable getMethod() {
        return m;
    }

    public FieldInterfacedFromParameter(FieldInterfacedFromParameter f) {
        this(f.getMethod(), f.getParameter());
    }

    @Override
    public Field getField() {
        return null;
    }

    @Override
    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
        return (ff != null)?ff.getDeclaredAnnotationsByType(annotationClass): p.getDeclaredAnnotationsByType(annotationClass);
    }

    public FieldInterfacedFromParameter(Executable m, Parameter f) {
        this.ff = null;
        this.p = f;
        this.m = m;
    }

    @Override
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        if (extraAnnotations.size() > 0) {
            for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return true;
        }
        if (ManyToOne.class.equals(annotationClass) && p.getType().isAnnotationPresent(Entity.class)) return true;
        return (ff != null)?ff.isAnnotationPresent(annotationClass): p.isAnnotationPresent(annotationClass);
    }

    @Override
    public Class<?> getType() {
        return (ff != null)?ff.getType(): p.getType();
    }

    @Override
    public AnnotatedType getAnnotatedType() {
        return (ff != null)?ff.getAnnotatedType(): p.getAnnotatedType();
    }



    @Override
    public Class<?> getGenericClass() {
        if (ff != null) return ff.getGenericClass();
        else if (p.getType().isAnnotationPresent(Entity.class)) {
            return p.getType();
        } else if (p.getParameterizedType() != null) {
            ParameterizedType genericType = null;
            Type aux = p.getAnnotatedType().getType();
            if (aux instanceof ParameterizedType) genericType = (ParameterizedType) aux;
            else genericType = (ParameterizedType) p.getParameterizedType();
            if (genericType != null && genericType.getActualTypeArguments().length > 0) {
                Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
                return genericClass;
            } else return null;

        } else return null;
    }

    @Override
    public Class<?> getDeclaringClass() {
        return (ff != null)?ff.getDeclaringClass(): Map.class;
    }

    @Override
    public Type getGenericType() {
        return (ff != null)?ff.getGenericType(): getGenericClass();
    }

    @Override
    public String getName() {
        return (ff != null)?ff.getName(): p.getName();
    }

    @Override
    public String getId() {
        return (ff != null)?ff.getId(): p.getName();
    }

    @Override
    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
        if (extraAnnotations.size() > 0) {
            for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return (T) a;
        }
        return (ff != null)?ff.getAnnotation(annotationClass): p.getAnnotation(annotationClass);
    }

    @Override
    public Class<?> getOptionsClass() {
        return (ff != null)?ff.getOptionsClass():((p.isAnnotationPresent(ValueClass.class))? p.getAnnotation(ValueClass.class).value():null);
    }

    @Override
    public String getOptionsQL() {
        return (ff != null)?ff.getOptionsQL():((p.isAnnotationPresent(ValueQL.class))? p.getAnnotation(ValueQL.class).value():null);
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
        return p.getModifiers();
    }

    @Override
    public DataProvider getDataProvider() {
        return null;
    }

    @Override
    public Annotation[] getDeclaredAnnotations() {
        return (ff != null)?ff.getDeclaredAnnotations(): p.getDeclaredAnnotations();
    }

    @Override
    public String toString() {
        return getName();
    }

    @Override
    public int hashCode() {
        return ("" + getMethod().getDeclaringClass().getName() + "/" + getParameter().getName() + "").hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && hashCode() == obj.hashCode());
    }
}
