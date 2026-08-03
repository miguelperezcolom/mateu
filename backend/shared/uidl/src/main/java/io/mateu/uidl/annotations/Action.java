package io.mateu.uidl.annotations;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Repeatable(Actions.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface Action {

  String id() default "";

  boolean background() default false;

  boolean validationRequired() default false;

  boolean confirmationRequired() default false;

  boolean rowsSelectedRequired() default false;

  String confirmationTitle() default "";

  String confirmationMessage() default "";

  String confirmationText() default "";

  String confirmationDenialText() default "";

  String modalStyle() default "";

  String modalTitle() default "";

  String customEventName() default "";

  String customEventDetail() default "";

  String href() default "";

  String js() default "";

  boolean sse() default false;

  String fieldsToValidate() default "";

  boolean bubble() default false;

  String shortcut() default "";

  /**
   * How long the client waits for this action before giving up, in milliseconds. 0 keeps the client
   * default (60s).
   *
   * <p>One global ceiling cannot serve both a type-ahead lookup, which should give up in seconds so
   * the user can retype, and a report export, which may legitimately run for minutes. Set it per
   * action: short for anything the user is waiting on interactively, long for batch work.
   */
  int timeoutMillis() default 0;

  /**
   * Declares that re-running this action cannot apply the same change twice, so the client may
   * retry it by itself after a transient network failure instead of surfacing an error.
   *
   * <p>Only for genuine reads or naturally idempotent writes. When a request times out the client
   * does NOT know whether the server processed it, so marking a create or a charge idempotent risks
   * a silent duplicate. Reads (searches, loads) are detected automatically; this flag is for the
   * cases the framework cannot infer.
   */
  boolean idempotent() default false;
}
