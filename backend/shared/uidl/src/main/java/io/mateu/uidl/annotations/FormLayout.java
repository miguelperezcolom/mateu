package io.mateu.uidl.annotations;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
public @interface FormLayout {

  String theme() default "";

  String style() default "";

  int columns() default 2;
}
