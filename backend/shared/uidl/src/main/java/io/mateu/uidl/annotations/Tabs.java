package io.mateu.uidl.annotations;

public @interface Tabs {

  String theme() default "";

  String direction() default "";

  String style() default "";
}
