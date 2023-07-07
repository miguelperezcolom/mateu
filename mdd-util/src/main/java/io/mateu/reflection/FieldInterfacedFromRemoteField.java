package io.mateu.reflection;

import io.mateu.fakeAnnotations.Caption;
import io.mateu.mdd.shared.interfaces.Choice;
import io.mateu.mdd.shared.interfaces.Option;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.remote.dtos.Field;
import io.mateu.remote.dtos.ValidationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FieldInterfacedFromRemoteField implements FieldInterfaced {

    private final Field f;

    private Choice choice;

    public Choice getChoice() {
        return choice;
    }

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
        if (Choice.class.isAssignableFrom(getType())) {
            choice = new Choice() {
                @Override
                public List<Option> getOptions() {
                    return f.getAttributes().stream().filter(p -> "choice".equals(p.getKey()))
                            .map(p -> (Map) p.getValue())
                            .map(p -> new Option("" + p.get("key"), p.get("value")))
                            .collect(Collectors.toList());
                }
            };
        }
    }

    @Override
    public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
        if (NotNull.class.equals(annotationClass) || NotEmpty.class.equals(annotationClass) || NotBlank.class.equals(annotationClass)) {
            return f.getValidations() != null && f.getValidations().stream().filter(v -> ValidationType.NotEmpty.equals(v.getType())).findAny().isPresent();
        }
        if (io.mateu.mdd.shared.annotations.Caption.class.equals(annotationClass)) return true;
        return false;
    }

    @Override
    public Class<?> getType() {
        Class t = String.class;
        switch (f.getType()) {
            case "String": return String.class;
            case "int": return int.class;
            case "boolean": return boolean.class;
            case "enum": return Choice.class;
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
                if (isAnnotationPresent(NotNull.class)) {
                    return new Annotation[] {
                            new Annotation() {
                                @Override
                                public Class<? extends Annotation> annotationType() {
                                    if (choice != null) {
                                        return NotNull.class;
                                    }
                                    return NotEmpty.class;
                                }
                            }
                    };
                }
                return new Annotation[0];
            }

            @Override
            public Annotation[] getDeclaredAnnotations() {
                if (isAnnotationPresent(NotNull.class)) {
                    return new Annotation[] {
                            new Annotation() {
                                @Override
                                public Class<? extends Annotation> annotationType() {
                                    if (choice != null) {
                                        return NotNull.class;
                                    }
                                    return NotEmpty.class;
                                }
                            }
                    };
                }
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
    public Annotation[] getDeclaredAnnotations() {
        List<Annotation> annotations = new ArrayList<>();
        if (isAnnotationPresent(NotNull.class)) {
            if (choice != null) {
                annotations.add(new io.mateu.fakeAnnotations.NotNull());
            } else {
                annotations.add(new io.mateu.fakeAnnotations.NotNull());
            }
        }
        annotations.add(new Caption(f.getCaption()));
        return annotations.toArray(new Annotation[0]);
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
