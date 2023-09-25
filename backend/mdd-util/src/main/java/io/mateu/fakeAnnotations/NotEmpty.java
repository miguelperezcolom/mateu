package io.mateu.fakeAnnotations;

import jakarta.validation.Payload;
import java.lang.annotation.Annotation;

public class NotEmpty implements jakarta.validation.constraints.NotEmpty {
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
    return jakarta.validation.constraints.NotEmpty.class;
  }
}
