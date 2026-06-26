package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares the layout zones (columns) of a form, in left-to-right order. When present, the form's
 * {@link Section}s are distributed into these zones by their {@link Section#zone()} value and the
 * zones are rendered side by side, each zone stacking its sections vertically.
 *
 * <pre>
 * &#64;Zones({
 *     &#64;Zone(name = "left", width = "64%"),
 *     &#64;Zone(name = "right", width = "36%")
 * })
 * </pre>
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface Zones {

  Zone[] value();
}
