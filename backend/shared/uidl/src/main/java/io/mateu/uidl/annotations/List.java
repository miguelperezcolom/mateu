package io.mateu.uidl.annotations;

public @interface List {

  String style() default "";

  boolean ordered() default false;
}
