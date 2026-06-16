package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Repeatable(Links.class)
public @interface Link {

  String rel();

  String href();

  String type() default "";

  String as() default "";

  boolean crossorigin() default false;
}
