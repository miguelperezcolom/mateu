package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a field as a badge inside the form body. Shorthand for
 * {@code @Stereotype(FieldStereotype.badge)}.
 *
 * <p>For header-level badges (shown in the page header strip, not in the form body) use {@link
 * BadgeInHeader} instead.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface Badge {}
