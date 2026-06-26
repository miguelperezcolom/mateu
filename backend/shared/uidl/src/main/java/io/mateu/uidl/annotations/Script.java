package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
@Repeatable(Scripts.class)
public @interface Script {

  String src();

  String type() default "";

  boolean crossorigin() default false;

  boolean defer() default false;

  boolean async() default false;
}
