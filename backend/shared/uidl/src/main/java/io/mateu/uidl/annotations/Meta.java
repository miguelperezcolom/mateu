package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Repeatable(Metas.class)
public @interface Meta {

  String name() default "";

  String content();

  String httpEquiv() default "";

  String charset() default "";
}
