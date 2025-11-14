package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Validations.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Validation {

  String condition();

  String fieldId();

  String message();
}
