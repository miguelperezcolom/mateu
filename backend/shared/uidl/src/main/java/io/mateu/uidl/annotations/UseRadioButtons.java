package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders an enum field as radio buttons instead of the default dropdown, regardless of how many
 * constants the enum has. Equivalent to {@code @Stereotype(FieldStereotype.radio)} but
 * self-documenting on the field.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface UseRadioButtons {}
