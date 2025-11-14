package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Triggers.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Trigger {

  TriggerType type();

  String actionId();

  int timeoutMillis();

  int times();

  String condition();

  String calledActionId();

  String propertyName();

  String eventName();
}
