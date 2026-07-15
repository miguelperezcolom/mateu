package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Renders a collection field (typically a {@code List<String>}) as a plain read-only bulleted list
 * ({@code <ul>}). Shorthand for {@code @Stereotype(FieldStereotype.bulletedList)}.
 *
 * <p>For building the list programmatically (fluent component trees) use {@link
 * io.mateu.uidl.data.BulletedList} instead.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface BulletedList {}
