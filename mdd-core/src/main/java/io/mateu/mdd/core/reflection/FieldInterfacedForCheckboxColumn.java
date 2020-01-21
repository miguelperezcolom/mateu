package io.mateu.mdd.core.reflection;

import com.vaadin.data.provider.DataProvider;
import io.mateu.mdd.core.data.MDDBinder;
import io.mateu.mdd.core.util.Helper;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;
import java.util.Collection;

public class FieldInterfacedForCheckboxColumn implements FieldInterfaced {

    @ManyToOne
    private final Class type;
    private final String name;
    private final FieldInterfaced collectionField;
    private final Object value;
    private final MDDBinder binder;
    private DataProvider dataProvider;

    public FieldInterfacedForCheckboxColumn(String name, FieldInterfaced collectionField, Object value, MDDBinder binder) {
        this.type = boolean.class;
        this.name = name;
        this.dataProvider = null;
        this.collectionField = collectionField;
        this.value = value;
        this.binder = binder;
    }


    @Override
    public Field getField() {
        return null;
    }

    @Override
    public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
        return null;
    }


    @Override
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        return (ManyToOne.class.equals(annotationClass) && type.isAnnotationPresent(Entity.class))?true:false;
    }

    @Override
    public Class<?> getType() {
        return type;
    }

    @Override
    public AnnotatedType getAnnotatedType() {
        return new AnnotatedType() {
            @Override
            public Type getType() {
                return type;
            }

            @Override
            public <T extends Annotation> T getAnnotation(Class<T> aClass) {
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
        return ReflectionHelper.getGenericClass(type);
    }

    @Override
    public Class<?> getDeclaringClass() {
        return null;
    }

    @Override
    public Type getGenericType() {
        return ReflectionHelper.getGenericClass(type);
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getId() {
        return getName();
    }

    @Override
    public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
        return (ManyToOne.class.equals(annotationClass) && type.isAnnotationPresent(Entity.class))? (T) type.getAnnotation(ManyToOne.class) :null;
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
        return ((Collection)ReflectionHelper.getValue(collectionField, o)).contains(value);
    }


    @Override
    public void setValue(Object o, Object v) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        Collection col = (Collection)ReflectionHelper.getValue(collectionField, o);
        if (!binder.getMergeables().contains(value)) binder.getMergeables().add(value);
        if (((Boolean)v)) {
            if (!col.contains(value)) col.add(value);
            ReflectionHelper.reverseMap(binder, collectionField, o, value);
        } else {
            col.remove(value);
            ReflectionHelper.unReverseMap(binder, collectionField, o, value);
        }
    }

    @Override
    public int getModifiers() {
        return 0;
    }

    @Override
    public DataProvider getDataProvider() {
        return dataProvider;
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
        return (getName()).hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && hashCode() == obj.hashCode());
    }

    public String getCaption() {
        return Helper.capitalize(value.toString());
    }

}
