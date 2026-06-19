package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a page/form in a condensed (high-density) mode: smaller control sizes, spacing and font
 * sizes, so information-dense screens fit without scrolling. Implemented by injecting a Lumo
 * density preset ({@code io.mateu.uidl.StyleConstants#COMPACT}) into the page container, which
 * cascades to every component inside. Opt-in and non-breaking — pages without it are unaffected.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface Compact {}
