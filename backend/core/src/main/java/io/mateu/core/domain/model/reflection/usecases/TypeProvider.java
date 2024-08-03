package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.Field;
import org.springframework.stereotype.Service;

import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;

@Service
public class TypeProvider {

    public Class getType(AnnotatedElement f) {
        if (f instanceof Field) {
            return ((Field) f).getType();
        } else if (f instanceof Method) {
            return ((Method) f).getReturnType();
        } else {
            return null;
        }
    }

}
