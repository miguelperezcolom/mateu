package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares how an action BEHAVES — validation, confirmation, how the client calls it — on the
 * method that implements it (or, with {@link #id()}, on the class, for an action the method name
 * cannot carry).
 *
 * <p>{@code @Action} does <b>not</b> draw a button: put {@link Toolbar} (page header) or {@link
 * Button} (under the content) on the same method for that, or reference the action id from a fluent
 * {@code Button}. On its own, an {@code @Action} method is still callable — by a {@link
 * #shortcut()}, a {@link Trigger}, or a button supplied in code.
 *
 * <pre>{@code
 * @Toolbar
 * @Action(validationRequired = true, confirmationRequired = true, shortcut = "ctrl+s")
 * public Object save() { ... }
 * }</pre>
 *
 * <p>An action that returns a {@code String} (or any plain value) shows it as a message and leaves
 * the screen as it was. Repeatable: several {@code @Action}s on one class declare several ids.
 *
 * @see Toolbar
 * @see Button
 */
@Repeatable(Actions.class)
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface Action {

  /** The action id. Blank (the default) on a method: the method name. Required on a class. */
  String id() default "";

  /**
   * Runs without any busy feedback (no veil, no busy control) and without blocking its own next run
   * — for autosaves and polls the user did not ask for.
   */
  boolean background() default false;

  /**
   * The form must pass its validations (client-side, then re-checked on the server) before the
   * action runs; a rejected one shows the errors and focuses the first invalid field.
   */
  boolean validationRequired() default false;

  /**
   * Asks the user to confirm before running (texts: {@link #confirmationTitle()}, {@link
   * #confirmationMessage()}, {@link #confirmationText()}, {@link #confirmationDenialText()}).
   */
  boolean confirmationRequired() default false;

  /** On a listing: the action is only enabled while at least one row is selected. */
  boolean rowsSelectedRequired() default false;

  /** Title of the confirmation dialog ({@link #confirmationRequired()}). */
  String confirmationTitle() default "";

  /** Message of the confirmation dialog. */
  String confirmationMessage() default "";

  /** Label of the confirmation dialog's accept button. */
  String confirmationText() default "";

  /** Label of the confirmation dialog's cancel button. */
  String confirmationDenialText() default "";

  /** Not sent to the client today: it has no effect. */
  String modalStyle() default "";

  /** Not sent to the client today: it has no effect. */
  String modalTitle() default "";

  /**
   * Runs in the browser instead of calling the server: dispatches a DOM {@code CustomEvent} with
   * this name (bubbling, composed) carrying {@link #customEventDetail()} as its detail.
   */
  String customEventName() default "";

  /** The detail of the {@link #customEventName()} event. */
  String customEventDetail() default "";

  /** Navigates the browser to this URL instead of calling the server. */
  String href() default "";

  /**
   * Runs this JavaScript in the browser instead of calling the server. Off unless the page opts in
   * to run-JS ({@code <meta name="mateu-allow-run-js" content="true">}).
   */
  String js() default "";

  /**
   * Calls the action over server-sent events, so a long-running action can stream progress
   * fragments ({@code LongTask}) before its result.
   */
  boolean sse() default false;

  /**
   * With {@link #validationRequired()}: a comma-separated list of the field ids to validate,
   * instead of the whole form.
   */
  String fieldsToValidate() default "";

  /**
   * Hands the action to the ENCLOSING component instead of running it on this one, with this
   * component's state as {@code initiatorState} — for a nested island whose button belongs to its
   * host.
   */
  boolean bubble() default false;

  /**
   * A keyboard shortcut that runs the action: {@code +}-separated modifiers ({@code ctrl}, {@code
   * alt}, {@code shift}, {@code meta}) and a key, e.g. {@code "ctrl+s"} or {@code "enter"}. Matched
   * by key or by physical key code, so it works on any keyboard layout.
   */
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
