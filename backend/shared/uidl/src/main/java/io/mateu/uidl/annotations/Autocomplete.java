package io.mateu.uidl.annotations;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The purpose of a field that collects information about the user (WCAG 2.2 SC 1.3.5 Identify Input
 * Purpose): an HTML {@code autocomplete} token such as {@code email}, {@code given-name}, {@code
 * tel}, {@code street-address}, {@code postal-code} or {@code new-password}. Browsers and assistive
 * technologies use it to autofill the field and to show its purpose; the native renderers map it to
 * their platform's content types. {@code "off"} turns autofill off.
 *
 * <p>Mateu infers {@code email} for an email field (stereotype {@code email}); every other purpose
 * must be declared, because a name alone cannot tell whose data a field holds.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
@Documented
public @interface Autocomplete {

  /** The autocomplete token (one or more space-separated, e.g. {@code "shipping postal-code"}). */
  String value();
}
