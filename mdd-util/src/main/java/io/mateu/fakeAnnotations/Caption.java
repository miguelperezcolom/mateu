package io.mateu.fakeAnnotations;

import java.lang.annotation.Annotation;

public class Caption implements io.mateu.mdd.shared.annotations.Caption {

    private final String value;

    public Caption(String value) {
        this.value = value;
    }

    @Override
    public String value() {
        return value;
    }

    @Override
    public Class<? extends Annotation> annotationType() {
        return io.mateu.mdd.shared.annotations.Caption.class;
    }
}
