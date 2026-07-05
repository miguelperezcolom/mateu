package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a navigation icon at the right side of the field that takes the user to the given URL or
 * route. The value is interpolated client-side against the live component state, so it can point to
 * a related record, e.g. {@code @LinkTo("/customers/${state.customerId}")} — the link follows the
 * value as the user edits the form. For a programmatic alternative implement {@link
 * io.mateu.uidl.interfaces.LinkSupplier} on the view class (it takes precedence over this
 * annotation).
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface LinkTo {

  /** Destination URL or route. Supports {@code ${...}} state interpolation. */
  String value();

  /** Icon to render; renderer picks a sensible default when empty. */
  String icon() default "";

  /** Tooltip for the icon. Supports {@code ${...}} state interpolation. */
  String title() default "";

  /** Link target, e.g. {@code _blank} to open in a new tab. */
  String target() default "";
}
