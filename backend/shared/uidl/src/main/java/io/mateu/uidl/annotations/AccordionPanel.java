package io.mateu.uidl.annotations;

public @interface AccordionPanel {

  String theme() default "";

  String style() default "";

  String summary() default "";

  boolean disabled() default false;
}
