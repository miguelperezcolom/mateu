package io.mateu.fakeAnnotations;

import javax.validation.Payload;
import java.lang.annotation.Annotation;

public class NotEmpty implements javax.validation.constraints.NotEmpty {
    @Override
    public String message() {
        return null;
    }

    @Override
    public Class<?>[] groups() {
        return new Class[0];
    }

    @Override
    public Class<? extends Payload>[] payload() {
        return new Class[0];
    }

    @Override
    public Class<? extends Annotation> annotationType() {
        return javax.validation.constraints.NotEmpty.class;
    }
}
