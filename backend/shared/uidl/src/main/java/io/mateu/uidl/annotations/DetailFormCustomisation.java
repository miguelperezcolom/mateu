package io.mateu.uidl.annotations;

import io.mateu.uidl.data.FormPosition;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Created by miguel on 18/1/17. */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface DetailFormCustomisation {

  FormPosition position() default FormPosition.right;

  String style() default "";

    String theme() default "";

    int columns() default 2;
}
