package io.mateu.fakeAnnotations;

import javax.validation.Payload;
import java.lang.annotation.Annotation;

public class NotNull implements javax.validation.constraints.NotNull {
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
        return javax.validation.constraints.NotNull.class;
    }
}
