package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Subscribes a component to a named custom event emitted by another component (or itself).
 *
 * <p>When the event fires, Mateu runs the {@link #action()} method on this component server-side,
 * passing the event payload as the action parameters. Place it at class level on any form/page
 * component; it is repeatable.
 *
 * <p>Events are emitted with {@link io.mateu.uidl.data.UICommand#dispatchEvent(String, Object)}.
 * Use {@link #source()} to choose where to listen:
 *
 * <pre>{@code
 * @SubscribeTo(event = "checkin-confirmed", action = "refresh")                       // DOCUMENT (global bus)
 * @SubscribeTo(event = "room-assigned", action = "reload", source = COMPONENT, from = "rooms-panel")
 * }</pre>
 *
 * @see Emits
 * @see io.mateu.uidl.data.UICommand#dispatchEvent(String, Object)
 */
@Repeatable(SubscribesTo.class)
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface SubscribeTo {

  /** Name of the custom event to listen for. */
  String event();

  /** Id of the action (method name) to run on this component when the event fires. */
  String action();

  /** Where to listen. Defaults to {@link SubscriptionSource#DOCUMENT} (global bus). */
  SubscriptionSource source() default SubscriptionSource.DOCUMENT;

  /**
   * Logical name of the emitting component to filter by, used only when {@link #source()} is {@link
   * SubscriptionSource#COMPONENT}. Matches the emitter's {@link Emits#name()}.
   */
  String from() default "";

  /** Optional client-side condition expression that must hold for the action to run. */
  String condition() default "";
}
