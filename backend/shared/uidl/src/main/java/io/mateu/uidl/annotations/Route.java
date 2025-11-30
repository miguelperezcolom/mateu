package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Routes.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Route {

  String value();

  String[] uis() default {};

  String parentRoute() default "_empty";
}
