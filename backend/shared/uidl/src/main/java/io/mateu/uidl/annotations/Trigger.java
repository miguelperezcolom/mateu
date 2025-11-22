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
}
