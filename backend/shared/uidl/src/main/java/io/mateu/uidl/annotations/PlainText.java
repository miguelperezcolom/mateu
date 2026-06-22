package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a field's value as plain, read-only text instead of an input control. Opt-in and
 * orthogonal: it does not change the default rendering of any field that is not annotated.
 * Typically combined with {@link ReadOnly} for dense, display-only screens.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.FIELD, ElementType.METHOD})
public @interface PlainText {}
