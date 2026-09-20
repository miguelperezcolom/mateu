package io.mateu.uidl.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a listing/CRUD row field as the rich <b>primary</b> column (coherence-plan #6): the field's
 * value is the cell TITLE, with an optional secondary caption line and an optional leading
 * avatar/icon, composed into one cell — the 80% "primary" table pattern without hand-building the
 * cell.
 *
 * <ul>
 *   <li>{@code caption} — the name of another row field whose value is shown as the secondary line
 *       (e.g. an email under a name). Empty = no caption line.
 *   <li>{@code leading} — the name of a row field carrying an avatar/icon URL shown before the
 *       title. Empty = no leading element.
 * </ul>
 *
 * Composable ({@code ANNOTATION_TYPE}) like the other field annotations; read via {@code
 * MetaAnnotations}. Sets the column's stereotype to {@code primary} and its {@code
 * captionPath}/{@code leadingPath}.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface PrimaryColumn {
  String caption() default "";

  String leading() default "";
}
