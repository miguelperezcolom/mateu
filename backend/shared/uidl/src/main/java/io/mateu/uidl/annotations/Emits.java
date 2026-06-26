package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares the custom events a component emits and, optionally, the logical name under which it
 * emits them.
 *
 * <p>This annotation is mostly documentary: events are actually emitted at runtime by returning
 * {@link io.mateu.uidl.data.UICommand#dispatchEvent(String, Object)} from an action. Its one
 * runtime effect is {@link #name()}: when set, it is stamped into every event this component emits
 * (as {@code detail.__source}) so that subscribers using {@link SubscribeTo} with {@link
 * SubscriptionSource#COMPONENT} can filter by origin. When omitted, the component's server-side
 * type acts as the implicit source name.
 *
 * @see SubscribeTo
 * @see io.mateu.uidl.data.UICommand#dispatchEvent(String, Object)
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface Emits {

  /** Names of the events this component emits (documentary only). */
  String[] events() default {};

  /** Logical source name stamped into emitted events as {@code detail.__source}. */
  String name() default "";
}
