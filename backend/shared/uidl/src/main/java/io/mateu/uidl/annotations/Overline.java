package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The small line of text shown ABOVE the page title (the Oracle Redwood {@code overlineText} header
 * element) — typically a category, a parent context or a step marker: "Reservations", "Q3
 * campaign", "Step 2 of 4".
 *
 * <p>Use {@link io.mateu.uidl.interfaces.OverlineSupplier} instead when the text depends on runtime
 * state; the supplier wins over this annotation when both are present.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface Overline {

  String value();
}
