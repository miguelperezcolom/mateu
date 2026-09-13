package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Triggers.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Trigger {

  TriggerType type();

  String actionId();

  int timeoutMillis() default 0;

  int times() default 1;

  String condition() default "";

  String calledActionId() default "";

  String propertyName() default "";

  String eventName() default "";

  /**
   * Run the triggered action as a silent background refresh — no loading veil, no busy affordance.
   * For {@code OnLoad}/{@code OnSuccess} status polls that re-fetch a screen in place; leave false
   * (the default) for a first-load fetch that should show the veil.
   */
  boolean background() default false;
}
