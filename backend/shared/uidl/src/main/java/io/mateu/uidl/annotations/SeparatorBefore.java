package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Paints a horizontal divider line ({@code <hr>}) above the annotated field, occupying the full
 * form width — for separating groups of contents inside a section or form without starting a new
 * section. The fluent counterpart is {@link io.mateu.uidl.data.Separator}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface SeparatorBefore {}
