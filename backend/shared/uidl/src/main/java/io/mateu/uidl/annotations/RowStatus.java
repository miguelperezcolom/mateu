package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks the field of a listing ROW whose value tones the whole row — e.g. a reservation that is due
 * out, a room out of order, a charge in dispute. The value names the tone: {@code success}, {@code
 * warning}, {@code danger} (also {@code error}), {@code info} or {@code neutral}; for an enum, its
 * constant name (lower-cased) is used, so an enum whose constants are those tones works as is; a
 * {@code Status} value uses its type. Any other value leaves the row untoned. One per row class;
 * the first one found wins.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Experimental("row tones (3.0-alpha.409)")
public @interface RowStatus {}
